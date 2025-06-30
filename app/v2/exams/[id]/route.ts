import { NextRequest, NextResponse } from 'next/server';
import { getExamDetails } from '@/lib/api/exams/get-exam-details';
import { EnemApiError, handleAndReturnErrorResponse } from '@/lib/api/errors';
import { RateLimiter } from '@/lib/api/rate-limit';
import { logger } from '@/lib/api/logger';
import { getExamsV2 } from '../_lib/get-exams';

export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiter();

const getExamsIds = async () => {
    const exams = await getExamsV2();
    return exams.map(exam => exam.id);
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { rateLimitHeaders } = rateLimiter.check(request);

        await logger(request);

        const examIds = await getExamsIds();

        if (!examIds.includes(params.id)) {
            throw new EnemApiError({
                code: 'not_found',
                message: `No exam found for id ${params.id}`,
            });
        }

        const exam = await getExamDetails(params.id);

        return NextResponse.json(exam, { headers: rateLimitHeaders });
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
