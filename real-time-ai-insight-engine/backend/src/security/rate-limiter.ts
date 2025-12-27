/**
 * Advanced Rate Limiting System
 * Enterprise-grade DDoS protection and API throttling
 */

import { Request, Response, NextFunction } from 'express';
import { cache, CacheKeys } from '../cache/redis';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    message?: string;
    statusCode?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    handler?: (req: Request, res: Response) => void;
}

export interface RateLimitInfo {
    limit: number;
    current: number;
    remaining: number;
    resetTime: number;
}

export class RateLimiter {
    private config: Required<RateLimitConfig>;

    constructor(config: RateLimitConfig) {
        this.config = {
            windowMs: config.windowMs,
            maxRequests: config.maxRequests,
            message: config.message || 'Too many requests, please try again later',
            statusCode: config.statusCode || 429,
            skipSuccessfulRequests: config.skipSuccessfulRequests || false,
            skipFailedRequests: config.skipFailedRequests || false,
            keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
            handler: config.handler || this.defaultHandler,
        };
    }

    /**
     * Default key generator (IP-based)
     */
    private defaultKeyGenerator(req: Request): string {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        return `ip:${ip}`;
    }

    /**
     * Default rate limit exceeded handler
     */
    private defaultHandler(req: Request, res: Response): void {
        res.status(this.config.statusCode).json({
            error: 'Rate limit exceeded',
            message: this.config.message,
            retryAfter: Math.ceil(this.config.windowMs / 1000),
        });
    }

    /**
     * Get rate limit info for a key
     */
    async getRateLimitInfo(key: string): Promise<RateLimitInfo> {
        const cacheKey = CacheKeys.rateLimit(key);
        const current = (await cache.get<number>(cacheKey)) || 0;
        const ttl = this.config.windowMs / 1000;

        return {
            limit: this.config.maxRequests,
            current,
            remaining: Math.max(0, this.config.maxRequests - current),
            resetTime: Date.now() + ttl * 1000,
        };
    }

    /**
     * Increment request count
     */
    async incrementCount(key: string): Promise<number> {
        const cacheKey = CacheKeys.rateLimit(key);
        const count = await cache.increment(cacheKey);

        // Set expiry on first request
        if (count === 1) {
            await cache.set(cacheKey, count, {
                ttl: Math.ceil(this.config.windowMs / 1000),
            });
        }

        return count;
    }

    /**
     * Check if request should be rate limited
     */
    async shouldLimit(key: string): Promise<boolean> {
        const count = await this.incrementCount(key);
        return count > this.config.maxRequests;
    }

    /**
     * Express middleware
     */
    middleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const key = this.config.keyGenerator(req);
                const info = await this.getRateLimitInfo(key);

                // Set rate limit headers
                res.setHeader('X-RateLimit-Limit', info.limit);
                res.setHeader('X-RateLimit-Remaining', info.remaining);
                res.setHeader('X-RateLimit-Reset', new Date(info.resetTime).toISOString());

                // Check if rate limited
                if (await this.shouldLimit(key)) {
                    logger.warn(`Rate limit exceeded for ${key}`);

                    res.setHeader('Retry-After', Math.ceil(this.config.windowMs / 1000));
                    this.config.handler(req, res);
                    return;
                }

                // Handle response to skip counting if configured
                if (this.config.skipSuccessfulRequests || this.config.skipFailedRequests) {
                    const originalSend = res.send;
                    res.send = function (body: any) {
                        const statusCode = res.statusCode;
                        const shouldSkip =
                            (this.config.skipSuccessfulRequests && statusCode < 400) ||
                            (this.config.skipFailedRequests && statusCode >= 400);

                        if (shouldSkip) {
                            // Decrement counter
                            cache.increment(CacheKeys.rateLimit(key), -1);
                        }

                        return originalSend.call(this, body);
                    }.bind(this);
                }

                next();
            } catch (error) {
                logger.error('Rate limiter error:', error);
                // Fail open - allow request if rate limiter fails
                next();
            }
        };
    }
}

// Preset rate limit configurations
export const RateLimitPresets = {
    /**
     * Strict rate limit for authentication endpoints
     */
    auth: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        message: 'Too many authentication attempts, please try again later',
    }),

    /**
     * Standard rate limit for API endpoints
     */
    api: new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
    }),

    /**
     * Relaxed rate limit for public endpoints
     */
    public: new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 300,
    }),

    /**
     * Very strict rate limit for expensive operations
     */
    expensive: new RateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
        message: 'This operation is rate limited, please try again later',
    }),

    /**
     * Per-user rate limit
     */
    perUser: (maxRequests: number = 100) =>
        new RateLimiter({
            windowMs: 60 * 1000, // 1 minute
            maxRequests,
            keyGenerator: (req: Request) => {
                const user = (req as any).user;
                return user ? `user:${user.id}` : `ip:${req.ip}`;
            },
        }),

    /**
     * Per-API-key rate limit
     */
    perApiKey: (maxRequests: number = 1000) =>
        new RateLimiter({
            windowMs: 60 * 1000, // 1 minute
            maxRequests,
            keyGenerator: (req: Request) => {
                const apiKey = req.headers['x-api-key'] as string;
                return apiKey ? `api-key:${apiKey}` : `ip:${req.ip}`;
            },
        }),
};

/**
 * Sliding window rate limiter (more accurate)
 */
export class SlidingWindowRateLimiter {
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number, maxRequests: number) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    /**
     * Check and increment with sliding window algorithm
     */
    async checkLimit(key: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        const cacheKey = CacheKeys.rateLimit(`sliding:${key}`);

        // Get timestamps of requests in current window
        const timestamps = (await cache.get<number[]>(cacheKey)) || [];

        // Filter out old timestamps
        const validTimestamps = timestamps.filter(ts => ts > windowStart);

        // Check if limit exceeded
        const allowed = validTimestamps.length < this.maxRequests;

        if (allowed) {
            // Add current timestamp
            validTimestamps.push(now);
            await cache.set(cacheKey, validTimestamps, {
                ttl: Math.ceil(this.windowMs / 1000),
            });
        }

        return {
            allowed,
            info: {
                limit: this.maxRequests,
                current: validTimestamps.length,
                remaining: Math.max(0, this.maxRequests - validTimestamps.length),
                resetTime: now + this.windowMs,
            },
        };
    }

    /**
     * Express middleware
     */
    middleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const ip = req.ip || 'unknown';
                const { allowed, info } = await this.checkLimit(ip);

                // Set rate limit headers
                res.setHeader('X-RateLimit-Limit', info.limit);
                res.setHeader('X-RateLimit-Remaining', info.remaining);
                res.setHeader('X-RateLimit-Reset', new Date(info.resetTime).toISOString());

                if (!allowed) {
                    logger.warn(`Sliding window rate limit exceeded for ${ip}`);
                    res.setHeader('Retry-After', Math.ceil(this.windowMs / 1000));
                    return res.status(429).json({
                        error: 'Rate limit exceeded',
                        message: 'Too many requests, please try again later',
                    });
                }

                next();
            } catch (error) {
                logger.error('Sliding window rate limiter error:', error);
                next();
            }
        };
    }
}

/**
 * Distributed rate limiter for multiple servers
 */
export class DistributedRateLimiter extends RateLimiter {
    /**
     * Use Redis for distributed counting
     */
    async incrementCount(key: string): Promise<number> {
        const cacheKey = CacheKeys.rateLimit(`distributed:${key}`);
        const count = await cache.increment(cacheKey);

        if (count === 1) {
            await cache.set(cacheKey, count, {
                ttl: Math.ceil(this.config.windowMs / 1000),
            });
        }

        return count;
    }
}

/**
 * Create custom rate limiter with specific configuration
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
    return new RateLimiter(config);
}

/**
 * Combine multiple rate limiters
 */
export function combineRateLimiters(...limiters: RateLimiter[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        for (const limiter of limiters) {
            const middleware = limiter.middleware();
            await new Promise<void>((resolve, reject) => {
                middleware(req, res, (err?: any) => {
                    if (err) reject(err);
                    else if (res.headersSent) reject(new Error('Rate limit exceeded'));
                    else resolve();
                });
            }).catch(() => {
                // Rate limit exceeded, stop checking
                return;
            });
        }
        next();
    };
}
