import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
    interval: number; // Time window in milliseconds
    uniqueTokenPerInterval: number; // Max requests per interval
}

const rateLimiters = new Map<string, LRUCache<string, number>>();

function getRateLimiter(name: string, options: RateLimitOptions): LRUCache<string, number> {
    if (!rateLimiters.has(name)) {
        rateLimiters.set(
            name,
            new LRUCache({
                max: options.uniqueTokenPerInterval || 500,
                ttl: options.interval || 60000,
            })
        );
    }
    return rateLimiters.get(name)!;
}

export function rateLimit(options: RateLimitOptions = { interval: 60000, uniqueTokenPerInterval: 100 }) {
    return async (request: NextRequest, handler: () => Promise<NextResponse>) => {
        const limiter = getRateLimiter('api', options);

        // Get identifier (IP or user ID)
        const identifier = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'anonymous';

        const tokenCount = limiter.get(identifier) || 0;

        if (tokenCount >= options.uniqueTokenPerInterval) {
            return NextResponse.json(
                {
                    error: 'Rate Limit Exceeded',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: Math.ceil(options.interval / 1000),
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': options.uniqueTokenPerInterval.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(Date.now() + options.interval).toISOString(),
                        'Retry-After': Math.ceil(options.interval / 1000).toString(),
                    },
                }
            );
        }

        limiter.set(identifier, tokenCount + 1);

        const response = await handler();

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', options.uniqueTokenPerInterval.toString());
        response.headers.set('X-RateLimit-Remaining', (options.uniqueTokenPerInterval - tokenCount - 1).toString());
        response.headers.set('X-RateLimit-Reset', new Date(Date.now() + options.interval).toISOString());

        return response;
    };
}

// Specific rate limiters for different endpoints
export const strictRateLimit = rateLimit({
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
});

export const moderateRateLimit = rateLimit({
    interval: 60000,
    uniqueTokenPerInterval: 60, // 60 requests per minute
});

export const lenientRateLimit = rateLimit({
    interval: 60000,
    uniqueTokenPerInterval: 300, // 300 requests per minute
});
