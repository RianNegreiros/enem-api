import z from '@/lib/zod';
import { ZodOpenApiOperationObject } from 'zod-openapi';
import { ExamYearPath } from '@/lib/zod/schemas/exams';
import {
    BatchQuestionsRequestSchema,
    BatchQuestionsResponseSchema,
    GetQuestionsQuerySchema,
} from '@/lib/zod/schemas/questions';
import { openApiErrorResponses } from '@/lib/openapi/responses';

export const batchQuestions: ZodOpenApiOperationObject = {
    operationId: 'batchQuestions',
    summary: 'Obter várias questões pelo índice',
    description:
        'Retorna os detalhes de várias questões de uma prova, dado uma lista de índices',
    requestParams: {
        path: z.object({
            year: ExamYearPath,
        }),
        query: GetQuestionsQuerySchema.pick({
            limit: true,
            offset: true,
            language: true,
        }),
    },
    requestBody: {
        content: {
            'application/json': {
                schema: BatchQuestionsRequestSchema,
            },
        },
    },
    responses: {
        '200': {
            description: 'Lista de questões buscadas',
            content: {
                'application/json': {
                    schema: BatchQuestionsResponseSchema,
                },
            },
        },
        ...openApiErrorResponses,
    },
    tags: ['Questões'],
};
