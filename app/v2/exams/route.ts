import { NextRequest, NextResponse } from 'next/server';
import { getExamsV2 } from './_lib/get-exams';
import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { RateLimiter } from '@/lib/api/rate-limit';
import { logger } from '@/lib/api/logger';

export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiter();

export async function GET(request: NextRequest) {
    try {
        const { rateLimitHeaders } = rateLimiter.check(request);

        await logger(request);

        const exams = await getExamsV2();

        return NextResponse.json(exams, { headers: rateLimitHeaders });
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
