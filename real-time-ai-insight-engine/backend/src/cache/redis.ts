/**
 * Redis Caching Layer
 * Enterprise-grade caching with distributed support
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

interface CacheOptions {
    ttl?: number; // Time to live in seconds
    prefix?: string;
}

class RedisCache {
    private client: RedisClientType | null = null;
    private isConnected = false;
    private readonly defaultTTL = 3600; // 1 hour
    private readonly prefix = 'ai-insight:';

    /**
     * Initialize Redis connection
     */
    async connect(): Promise<void> {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

            this.client = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.error('Redis: Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });

            this.client.on('error', (err) => {
                logger.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.info('Redis: Connected successfully');
                this.isConnected = true;
            });

            this.client.on('reconnecting', () => {
                logger.warn('Redis: Reconnecting...');
            });

            await this.client.connect();
        } catch (error) {
            logger.error('Redis: Connection failed:', error);
            throw error;
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            logger.info('Redis: Disconnected');
        }
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected || !this.client) {
            logger.warn('Redis: Not connected, skipping cache get');
            return null;
        }

        try {
            const fullKey = this.prefix + key;
            const value = await this.client.get(fullKey);

            if (!value) return null;

            return JSON.parse(value) as T;
        } catch (error) {
            logger.error(`Redis: Error getting key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            logger.warn('Redis: Not connected, skipping cache set');
            return false;
        }

        try {
            const fullKey = (options?.prefix || this.prefix) + key;
            const ttl = options?.ttl || this.defaultTTL;
            const serialized = JSON.stringify(value);

            await this.client.setEx(fullKey, ttl, serialized);
            return true;
        } catch (error) {
            logger.error(`Redis: Error setting key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete key from cache
     */
    async delete(key: string): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const fullKey = this.prefix + key;
            await this.client.del(fullKey);
            return true;
        } catch (error) {
            logger.error(`Redis: Error deleting key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple keys matching pattern
     */
    async deletePattern(pattern: string): Promise<number> {
        if (!this.isConnected || !this.client) {
            return 0;
        }

        try {
            const fullPattern = this.prefix + pattern;
            const keys = await this.client.keys(fullPattern);

            if (keys.length === 0) return 0;

            await this.client.del(keys);
            return keys.length;
        } catch (error) {
            logger.error(`Redis: Error deleting pattern ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const fullKey = this.prefix + key;
            const result = await this.client.exists(fullKey);
            return result === 1;
        } catch (error) {
            logger.error(`Redis: Error checking existence of key ${key}:`, error);
            return false;
        }
    }

    /**
     * Increment counter
     */
    async increment(key: string, amount = 1): Promise<number> {
        if (!this.isConnected || !this.client) {
            return 0;
        }

        try {
            const fullKey = this.prefix + key;
            return await this.client.incrBy(fullKey, amount);
        } catch (error) {
            logger.error(`Redis: Error incrementing key ${key}:`, error);
            return 0;
        }
    }

    /**
     * Get or set with callback (cache-aside pattern)
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        // Try to get from cache first
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch fresh data
        const fresh = await fetchFn();

        // Store in cache
        await this.set(key, fresh, options);

        return fresh;
    }

    /**
     * Set multiple keys at once
     */
    async mSet(entries: Record<string, any>, options?: CacheOptions): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const pipeline = this.client.multi();
            const ttl = options?.ttl || this.defaultTTL;

            for (const [key, value] of Object.entries(entries)) {
                const fullKey = (options?.prefix || this.prefix) + key;
                const serialized = JSON.stringify(value);
                pipeline.setEx(fullKey, ttl, serialized);
            }

            await pipeline.exec();
            return true;
        } catch (error) {
            logger.error('Redis: Error in mSet:', error);
            return false;
        }
    }

    /**
     * Get multiple keys at once
     */
    async mGet<T>(keys: string[]): Promise<(T | null)[]> {
        if (!this.isConnected || !this.client) {
            return keys.map(() => null);
        }

        try {
            const fullKeys = keys.map(key => this.prefix + key);
            const values = await this.client.mGet(fullKeys);

            return values.map(value => {
                if (!value) return null;
                try {
                    return JSON.parse(value) as T;
                } catch {
                    return null;
                }
            });
        } catch (error) {
            logger.error('Redis: Error in mGet:', error);
            return keys.map(() => null);
        }
    }

    /**
     * Flush all cache
     */
    async flush(): Promise<boolean> {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.flushDb();
            logger.info('Redis: Cache flushed');
            return true;
        } catch (error) {
            logger.error('Redis: Error flushing cache:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        connected: boolean;
        keys: number;
        memory: string;
    }> {
        if (!this.isConnected || !this.client) {
            return { connected: false, keys: 0, memory: '0' };
        }

        try {
            const info = await this.client.info('memory');
            const keys = await this.client.dbSize();

            const memoryMatch = info.match(/used_memory_human:(.+)/);
            const memory = memoryMatch ? memoryMatch[1].trim() : '0';

            return {
                connected: this.isConnected,
                keys,
                memory,
            };
        } catch (error) {
            logger.error('Redis: Error getting stats:', error);
            return { connected: this.isConnected, keys: 0, memory: '0' };
        }
    }
}

// Export singleton instance
export const cache = new RedisCache();

// Cache key builders
export const CacheKeys = {
    event: (id: string) => `event:${id}`,
    events: (orgId: string, start: string, end: string) =>
        `events:${orgId}:${start}:${end}`,
    insight: (id: string) => `insight:${id}`,
    insights: (orgId: string) => `insights:${orgId}`,
    alert: (id: string) => `alert:${id}`,
    alerts: (orgId: string) => `alerts:${orgId}`,
    metrics: (orgId: string) => `metrics:${orgId}`,
    user: (id: string) => `user:${id}`,
    session: (id: string) => `session:${id}`,
    rateLimit: (identifier: string) => `rate-limit:${identifier}`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
    WEEK: 604800, // 7 days
};
