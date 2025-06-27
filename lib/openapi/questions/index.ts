import { ZodOpenApiPathsObject } from 'zod-openapi';
import { getQuestions } from './get-questions';
import { getQuestionDetails } from './get-question-details';
import { batchQuestions } from './post-batch-questions';

export const questionsPaths: ZodOpenApiPathsObject = {
    '/exams/{year}/questions': {
        get: getQuestions,
        post: batchQuestions,
    },
    '/exams/{year}/questions/{index}': {
        get: getQuestionDetails,
    },
};
