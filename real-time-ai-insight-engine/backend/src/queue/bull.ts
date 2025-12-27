/**
 * Bull Job Queue System
 * Enterprise-grade background job processing
 */

import Queue, { Job, JobOptions, QueueOptions } from 'bull';
import { logger } from '../utils/logger';

// Job types
export enum JobType {
    ANALYZE_EVENTS = 'analyze-events',
    GENERATE_REPORT = 'generate-report',
    SEND_NOTIFICATION = 'send-notification',
    CLEANUP_OLD_DATA = 'cleanup-old-data',
    SYNC_DATA = 'sync-data',
    PROCESS_WEBHOOK = 'process-webhook',
}

// Job data interfaces
export interface AnalyzeEventsJobData {
    organizationId: string;
    periodStart: string;
    periodEnd: string;
    metricType?: string;
    sensitivity?: string;
}

export interface GenerateReportJobData {
    organizationId: string;
    reportType: string;
    format: 'pdf' | 'excel' | 'csv';
    recipients: string[];
    filters?: Record<string, any>;
}

export interface SendNotificationJobData {
    type: 'email' | 'slack' | 'webhook';
    recipient: string;
    subject?: string;
    message: string;
    metadata?: Record<string, any>;
}

export interface CleanupJobData {
    tableName: string;
    olderThan: string;
    batchSize?: number;
}

export interface SyncDataJobData {
    source: string;
    destination: string;
    filters?: Record<string, any>;
}

export interface WebhookJobData {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    retries?: number;
}

type JobData =
    | AnalyzeEventsJobData
    | GenerateReportJobData
    | SendNotificationJobData
    | CleanupJobData
    | SyncDataJobData
    | WebhookJobData;

class JobQueueManager {
    private queues: Map<JobType, Queue.Queue> = new Map();
    private redisUrl: string;

    constructor() {
        this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    }

    /**
     * Initialize all job queues
     */
    async initialize(): Promise<void> {
        const queueOptions: QueueOptions = {
            redis: this.redisUrl,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 100, // Keep last 100 completed jobs
                removeOnFail: 500, // Keep last 500 failed jobs
            },
        };

        // Create queues for each job type
        for (const jobType of Object.values(JobType)) {
            const queue = new Queue(jobType, queueOptions);

            // Set up event handlers
            this.setupQueueHandlers(queue, jobType);

            this.queues.set(jobType as JobType, queue);
            logger.info(`Queue initialized: ${jobType}`);
        }
    }

    /**
     * Set up event handlers for a queue
     */
    private setupQueueHandlers(queue: Queue.Queue, jobType: string): void {
        queue.on('error', (error) => {
            logger.error(`Queue ${jobType} error:`, error);
        });

        queue.on('waiting', (jobId) => {
            logger.debug(`Job ${jobId} waiting in queue ${jobType}`);
        });

        queue.on('active', (job) => {
            logger.info(`Job ${job.id} started processing in queue ${jobType}`);
        });

        queue.on('completed', (job, result) => {
            logger.info(`Job ${job.id} completed in queue ${jobType}`, { result });
        });

        queue.on('failed', (job, error) => {
            logger.error(`Job ${job.id} failed in queue ${jobType}:`, error);
        });

        queue.on('stalled', (job) => {
            logger.warn(`Job ${job.id} stalled in queue ${jobType}`);
        });
    }

    /**
     * Add a job to the queue
     */
    async addJob<T extends JobData>(
        jobType: JobType,
        data: T,
        options?: JobOptions
    ): Promise<Job<T>> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        const job = await queue.add(data, options);
        logger.info(`Job ${job.id} added to queue ${jobType}`);
        return job as Job<T>;
    }

    /**
     * Add multiple jobs at once
     */
    async addBulk<T extends JobData>(
        jobType: JobType,
        jobs: Array<{ data: T; options?: JobOptions }>
    ): Promise<Job<T>[]> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        const bulkJobs = await queue.addBulk(
            jobs.map((job) => ({
                data: job.data,
                opts: job.options,
            }))
        );

        logger.info(`${bulkJobs.length} jobs added to queue ${jobType}`);
        return bulkJobs as Job<T>[];
    }

    /**
     * Process jobs in a queue
     */
    process<T extends JobData>(
        jobType: JobType,
        concurrency: number,
        processor: (job: Job<T>) => Promise<any>
    ): void {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        queue.process(concurrency, async (job) => {
            try {
                logger.info(`Processing job ${job.id} of type ${jobType}`);
                const result = await processor(job as Job<T>);
                return result;
            } catch (error) {
                logger.error(`Error processing job ${job.id}:`, error);
                throw error;
            }
        });

        logger.info(`Processor registered for queue ${jobType} with concurrency ${concurrency}`);
    }

    /**
     * Get job by ID
     */
    async getJob(jobType: JobType, jobId: string): Promise<Job | null> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        return queue.getJob(jobId);
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(jobType: JobType): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);

        return { waiting, active, completed, failed, delayed };
    }

    /**
     * Get all queue statistics
     */
    async getAllStats(): Promise<Record<string, any>> {
        const stats: Record<string, any> = {};

        for (const [jobType, queue] of this.queues) {
            stats[jobType] = await this.getQueueStats(jobType);
        }

        return stats;
    }

    /**
     * Pause a queue
     */
    async pauseQueue(jobType: JobType): Promise<void> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        await queue.pause();
        logger.info(`Queue ${jobType} paused`);
    }

    /**
     * Resume a queue
     */
    async resumeQueue(jobType: JobType): Promise<void> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        await queue.resume();
        logger.info(`Queue ${jobType} resumed`);
    }

    /**
     * Clean old jobs from queue
     */
    async cleanQueue(
        jobType: JobType,
        grace: number = 3600000, // 1 hour
        status?: 'completed' | 'failed'
    ): Promise<void> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        if (status) {
            await queue.clean(grace, status);
        } else {
            await queue.clean(grace, 'completed');
            await queue.clean(grace, 'failed');
        }

        logger.info(`Queue ${jobType} cleaned`);
    }

    /**
     * Close all queues
     */
    async closeAll(): Promise<void> {
        for (const [jobType, queue] of this.queues) {
            await queue.close();
            logger.info(`Queue ${jobType} closed`);
        }
        this.queues.clear();
    }

    /**
     * Retry failed jobs
     */
    async retryFailed(jobType: JobType): Promise<number> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        const failed = await queue.getFailed();
        let retried = 0;

        for (const job of failed) {
            await job.retry();
            retried++;
        }

        logger.info(`Retried ${retried} failed jobs in queue ${jobType}`);
        return retried;
    }

    /**
     * Schedule a recurring job
     */
    async scheduleRecurring<T extends JobData>(
        jobType: JobType,
        data: T,
        cronExpression: string,
        options?: JobOptions
    ): Promise<Job<T>> {
        const queue = this.queues.get(jobType);
        if (!queue) {
            throw new Error(`Queue not found: ${jobType}`);
        }

        const job = await queue.add(data, {
            ...options,
            repeat: {
                cron: cronExpression,
            },
        });

        logger.info(`Recurring job scheduled in queue ${jobType}: ${cronExpression}`);
        return job as Job<T>;
    }
}

// Export singleton instance
export const jobQueue = new JobQueueManager();

// Helper functions for common job operations
export const JobHelpers = {
    /**
     * Schedule event analysis
     */
    async scheduleAnalysis(data: AnalyzeEventsJobData, delay?: number): Promise<Job> {
        return jobQueue.addJob(JobType.ANALYZE_EVENTS, data, {
            delay,
            priority: 1,
        });
    },

    /**
     * Schedule report generation
     */
    async scheduleReport(data: GenerateReportJobData, delay?: number): Promise<Job> {
        return jobQueue.addJob(JobType.GENERATE_REPORT, data, {
            delay,
            priority: 2,
        });
    },

    /**
     * Send notification
     */
    async sendNotification(data: SendNotificationJobData): Promise<Job> {
        return jobQueue.addJob(JobType.SEND_NOTIFICATION, data, {
            priority: 3,
            attempts: 5,
        });
    },

    /**
     * Schedule cleanup job (daily)
     */
    async scheduleCleanup(data: CleanupJobData): Promise<Job> {
        return jobQueue.scheduleRecurring(
            JobType.CLEANUP_OLD_DATA,
            data,
            '0 2 * * *' // 2 AM daily
        );
    },

    /**
     * Process webhook
     */
    async processWebhook(data: WebhookJobData): Promise<Job> {
        return jobQueue.addJob(JobType.PROCESS_WEBHOOK, data, {
            attempts: data.retries || 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });
    },
};
