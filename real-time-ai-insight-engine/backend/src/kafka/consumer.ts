import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { Server } from 'socket.io';
import { TransactionEvent, TimeWindow } from '../types';
import { logger } from '../utils/logger';
import { analyzeWithGemini } from '../ai/gemini';
import * as dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
    clientId: 'transaction-consumer',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || ''],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_API_KEY || '',
        password: process.env.KAFKA_API_SECRET || ''
    }
});

const consumer: Consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || 'ai-insight-consumer'
});

// Sliding window for aggregation
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const ANALYSIS_INTERVAL_MS = 30 * 1000; // Analyze every 30 seconds
const MAX_WINDOWS = 10; // Keep last 10 minutes

let timeWindows: TimeWindow[] = [];
let currentWindow: TimeWindow = createNewWindow();
let lastAnalysisTime = Date.now();
let totalEventsProcessed = 0;

function createNewWindow(): TimeWindow {
    return {
        timestamp: new Date().toISOString(),
        count: 0,
        total_amount: 0,
        avg_amount: 0,
        regions: {},
        types: {}
    };
}

function updateWindow(event: TransactionEvent): void {
    currentWindow.count++;
    currentWindow.total_amount += event.amount;
    currentWindow.avg_amount = currentWindow.total_amount / currentWindow.count;

    // Track regions
    currentWindow.regions[event.region] = (currentWindow.regions[event.region] || 0) + 1;

    // Track types
    currentWindow.types[event.type] = (currentWindow.types[event.type] || 0) + 1;
}

function rotateWindow(): void {
    if (currentWindow.count > 0) {
        timeWindows.push(currentWindow);

        // Keep only last MAX_WINDOWS
        if (timeWindows.length > MAX_WINDOWS) {
            timeWindows = timeWindows.slice(-MAX_WINDOWS);
        }
    }

    currentWindow = createNewWindow();
}

async function performAnalysis(io: Server): Promise<void> {
    if (timeWindows.length < 2) {
        logger.debug('Not enough data for analysis yet');
        return;
    }

    try {
        logger.info(`🤖 Analyzing ${timeWindows.length} time windows...`);

        const insight = await analyzeWithGemini(timeWindows);

        // Emit AI insight to all connected clients
        io.emit('ai_insight', insight);

        logger.info(`✨ AI Insight: ${insight.status} (${insight.severity}) - ${insight.summary}`);

    } catch (error) {
        logger.error('Error during AI analysis:', error);
    }
}

export async function startConsumer(io: Server): Promise<void> {
    await consumer.connect();
    await consumer.subscribe({
        topic: process.env.KAFKA_TOPIC || 'transaction-events',
        fromBeginning: false
    });

    logger.info('✅ Kafka consumer connected and subscribed');

    // Window rotation interval
    setInterval(() => {
        rotateWindow();
    }, WINDOW_SIZE_MS);

    // Analysis interval
    setInterval(async () => {
        const now = Date.now();
        if (now - lastAnalysisTime >= ANALYSIS_INTERVAL_MS) {
            await performAnalysis(io);
            lastAnalysisTime = now;
        }
    }, ANALYSIS_INTERVAL_MS);

    await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            try {
                const event: TransactionEvent = JSON.parse(message.value?.toString() || '{}');

                totalEventsProcessed++;
                updateWindow(event);

                // Emit individual event to connected clients
                io.emit('new_event', event);

                // Emit metrics update
                const metrics = {
                    total_events: totalEventsProcessed,
                    events_per_second: currentWindow.count / (WINDOW_SIZE_MS / 1000),
                    avg_transaction_amount: currentWindow.avg_amount,
                    active_regions: Object.keys(currentWindow.regions).length
                };

                io.emit('metrics_update', metrics);

                logger.debug(`📥 Processed event: ${event.id} from ${event.region}`);

            } catch (error) {
                logger.error('Error processing message:', error);
            }
        }
    });

    logger.info('🎧 Consumer is now listening for events...');
}

// Graceful shutdown
export async function stopConsumer(): Promise<void> {
    await consumer.disconnect();
    logger.info('⏹️  Consumer stopped');
}
