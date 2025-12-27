import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getRedisService } from '@/lib/services/redis';

/**
 * Test Redis connection and basic operations
 * GET /api/redis/test
 */
export async function GET(request: NextRequest) {
    return requireAuth(async (req, user) => {
        try {
            const redis = getRedisService();

            // Connect if not connected
            if (!redis.getStatus()) {
                await redis.connect();
            }

            // Run basic test
            await redis.set('test_key', 'test_value', 60); // 60 seconds expiration
            const result = await redis.get('test_key');

            return NextResponse.json({
                success: true,
                message: 'Redis connection successful',
                test: {
                    key: 'test_key',
                    value: result,
                    expected: 'test_value',
                    match: result === 'test_value',
                },
                status: {
                    connected: redis.getStatus(),
                },
            });
        } catch (error) {
            console.error('Redis test error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Redis connection failed',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                { status: 500 }
            );
        }
    })(request);
}

/**
 * Set value in Redis
 * POST /api/redis/set
 * Body: { key: string, value: string, ttl?: number }
 */
export async function POST(request: NextRequest) {
    return requireAuth(async (req, user) => {
        try {
            const body = await req.json();
            const { key, value, ttl } = body;

            if (!key || !value) {
                return NextResponse.json(
                    { error: 'Key and value are required' },
                    { status: 400 }
                );
            }

            const redis = getRedisService();

            if (!redis.getStatus()) {
                await redis.connect();
            }

            await redis.set(key, value, ttl);

            return NextResponse.json({
                success: true,
                message: 'Value set successfully',
                data: { key, value, ttl },
            });
        } catch (error) {
            console.error('Redis set error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to set value',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                { status: 500 }
            );
        }
    })(request);
}
