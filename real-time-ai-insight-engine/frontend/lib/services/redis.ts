/**
 * Redis Cache Service for Mahasi AI
 * Converted from C# StackExchange.Redis example
 * 
 * Original C# code:
 * - Uses StackExchange.Redis
 * - Connects to Redis Labs cloud instance
 * - Provides basic string get/set operations
 */

import { createClient, RedisClientType } from 'redis';

export class RedisService {
    private client: RedisClientType | null = null;
    private isConnected: boolean = false;

    /**
     * Connect to Redis server
     * Equivalent to ConnectionMultiplexer.Connect() in C#
     */
    async connect(): Promise<void> {
        try {
            // Create Redis client with configuration
            // Equivalent to C# ConfigurationOptions
            this.client = createClient({
                socket: {
                    host: 'redis-15983.c100.us-east-1-4.ec2.cloud.redislabs.com',
                    port: 15983,
                },
                username: 'default',
                password: 'VUf9ELFFV9p8N2G2HrcXR3HTLl50tZ4f',
            });

            // Error handling
            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Connected to Redis successfully');
                this.isConnected = true;
            });

            this.client.on('disconnect', () => {
                console.log('⚠️ Disconnected from Redis');
                this.isConnected = false;
            });

            // Connect to Redis
            await this.client.connect();

            console.log('🔗 Redis connection established');
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    /**
     * Set string value in Redis
     * Equivalent to db.StringSet("foo", "bar") in C#
     */
    async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client is not connected');
        }

        try {
            if (expirationSeconds) {
                await this.client.setEx(key, expirationSeconds, value);
            } else {
                await this.client.set(key, value);
            }
            console.log(`✅ Set key "${key}" = "${value}"`);
        } catch (error) {
            console.error(`Failed to set key "${key}":`, error);
            throw error;
        }
    }

    /**
     * Get string value from Redis
     * Equivalent to db.StringGet("foo") in C#
     */
    async get(key: string): Promise<string | null> {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client is not connected');
        }

        try {
            const result = await this.client.get(key);
            console.log(`📖 Get key "${key}" = "${result}"`);
            return result;
        } catch (error) {
            console.error(`Failed to get key "${key}":`, error);
            throw error;
        }
    }

    /**
     * Delete key from Redis
     */
    async delete(key: string): Promise<boolean> {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client is not connected');
        }

        try {
            const result = await this.client.del(key);
            console.log(`🗑️ Deleted key "${key}"`);
            return result > 0;
        } catch (error) {
            console.error(`Failed to delete key "${key}":`, error);
            throw error;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client is not connected');
        }

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Failed to check existence of key "${key}":`, error);
            throw error;
        }
    }

    /**
     * Set object as JSON string
     */
    async setObject<T>(key: string, value: T, expirationSeconds?: number): Promise<void> {
        const jsonString = JSON.stringify(value);
        await this.set(key, jsonString, expirationSeconds);
    }

    /**
     * Get object from JSON string
     */
    async getObject<T>(key: string): Promise<T | null> {
        const jsonString = await this.get(key);
        if (!jsonString) return null;

        try {
            return JSON.parse(jsonString) as T;
        } catch (error) {
            console.error(`Failed to parse JSON for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            console.log('👋 Disconnected from Redis');
        }
    }

    /**
     * Get connection status
     */
    getStatus(): boolean {
        return this.isConnected;
    }

    /**
     * Run basic example (equivalent to C# run() method)
     */
    async runBasicExample(): Promise<void> {
        try {
            // Connect to Redis
            await this.connect();

            // Set value (equivalent to db.StringSet("foo", "bar"))
            await this.set('foo', 'bar');

            // Get value (equivalent to db.StringGet("foo"))
            const result = await this.get('foo');

            // Output result (equivalent to Console.WriteLine(result))
            console.log('Result:', result); // >>> bar

            // Clean up
            await this.disconnect();
        } catch (error) {
            console.error('Error in basic example:', error);
            throw error;
        }
    }
}

// Singleton instance
let redisInstance: RedisService | null = null;

/**
 * Get Redis service instance
 */
export function getRedisService(): RedisService {
    if (!redisInstance) {
        redisInstance = new RedisService();
    }
    return redisInstance;
}

/**
 * Initialize Redis connection
 */
export async function initializeRedis(): Promise<RedisService> {
    const redis = getRedisService();
    if (!redis.getStatus()) {
        await redis.connect();
    }
    return redis;
}
