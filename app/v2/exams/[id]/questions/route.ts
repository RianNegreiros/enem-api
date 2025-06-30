import z from '@/lib/zod';
import { NextRequest, NextResponse } from 'next/server';
import { getSearchParamsAsObject } from '@/lib/utils';
import {
    QuestionDetailSchema,
    GetQuestionsQuerySchema,
} from '@/lib/zod/schemas/questions';
import { EnemApiError, handleAndReturnErrorResponse } from '@/lib/api/errors';
import { getExamDetails } from '@/lib/api/exams/get-exam-details';
import { getQuestionDetails } from '@/lib/api/questions/get-question-details';
import { RateLimiter } from '@/lib/api/rate-limit';
import { logger } from '@/lib/api/logger';

export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiter();

export async function GET(
    request: NextRequest,
    { params }: { params: { year: string } },
) {
    try {
        const { rateLimitHeaders } = rateLimiter.check(request);

        await logger(request);

        const searchParams = request.nextUrl.searchParams;

        let { limit, offset, language, discipline } =
            GetQuestionsQuerySchema.parse(
                getSearchParamsAsObject(searchParams),
            );

        if (Number(limit) > 50) {
            throw new EnemApiError({
                code: 'bad_request',
                message: 'Limit cannot be greater than 50',
            });
        }

        const exam = await getExamDetails(params.year);

        if (!exam) {
            throw new EnemApiError({
                code: 'not_found',
                message: `No exam found for year ${params.year}`,
            });
        }

        if (language && !exam.languages.find(lang => lang.value === language)) {
            throw new EnemApiError({
                code: 'bad_request',
                message: `Language ${language} not found in exam`,
            });
        }

        if (!language && exam.languages.length > 0) {
            language = exam.languages[0].value;
        }

        if (discipline && !exam.disciplines.find(d => d.value === discipline)) {
            throw new EnemApiError({
                code: 'bad_request',
                message: `Discipline ${discipline} not found in exam`,
            });
        }

        const filteredQuestions = exam.questions.filter(
            question =>
                (question.language === language || !question.language) &&
                (!discipline || question.discipline === discipline),
        );

        const questionsToFetch = filteredQuestions.slice(
            Number(offset),
            Number(offset) + Number(limit),
        );

        const questions: Array<z.infer<typeof QuestionDetailSchema>> = [];

        for (const question of questionsToFetch) {
            const questionDetails = await getQuestionDetails({
                year: params.year,
                index: question.index,
                language,
            });

            if (!questionDetails) {
                throw new EnemApiError({
                    code: 'internal_server_error',
                    message: `Failed to fetch question ${question.index}`,
                });
            }

            questions.push(questionDetails);
        }

        return NextResponse.json(
            {
                metadata: {
                    limit: Number(limit),
                    offset: Number(offset),
                    total: filteredQuestions.length,
                    hasMore:
                        Number(offset) + Number(limit) <
                        filteredQuestions.length,
                },
                questions,
            },
            { headers: rateLimitHeaders },
        );
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { year: string } },
) {
    try {
        const { rateLimitHeaders } = rateLimiter.check(request);
        await logger(request);

        const exam = await getExamDetails(params.year);
        if (!exam) {
            throw new EnemApiError({
                code: 'not_found',
                message: `No exam found for year ${params.year}`,
            });
        }

        const body = await request.json();
        const indices = body.indices;
        if (!Array.isArray(indices) || indices.length === 0) {
            throw new EnemApiError({
                code: 'bad_request',
                message:
                    '`indices` must be a non-empty array of question indices',
            });
        }

        const searchParams = request.nextUrl.searchParams;
        let { limit, offset, language } = GetQuestionsQuerySchema.parse(
            getSearchParamsAsObject(searchParams),
        );
        if (language && !exam.languages.find(lang => lang.value === language)) {
            throw new EnemApiError({
                code: 'bad_request',
                message: `Language ${language} not found in exam`,
            });
        }
        if (!language && exam.languages.length > 0) {
            language = exam.languages[0].value;
        }

        const paginatedIndices = indices.slice(
            Number(offset),
            Number(offset) + Number(limit),
        );

        const questions = [];
        for (const index of paginatedIndices) {
            const questionDetails = await getQuestionDetails({
                year: params.year,
                index,
                language,
            });
            if (!questionDetails) {
                throw new EnemApiError({
                    code: 'not_found',
                    message: `Question ${index} not found in exam ${params.year}`,
                });
            }
            questions.push(questionDetails);
        }

        return NextResponse.json(
            {
                metadata: {
                    limit: Number(limit),
                    offset: Number(offset),
                    total: indices.length,
                    hasMore: Number(offset) + Number(limit) < indices.length,
                },
                questions,
            },
            { headers: rateLimitHeaders },
        );
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
