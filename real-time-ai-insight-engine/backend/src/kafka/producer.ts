import { Kafka, Producer } from 'kafkajs';
import { TransactionEvent } from '../types';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
    clientId: 'transaction-producer',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || ''],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_API_KEY || '',
        password: process.env.KAFKA_API_SECRET || ''
    }
});

const producer: Producer = kafka.producer();

const REGIONS = ['US-NY', 'US-CA', 'ID-JB', 'SG-01', 'EU-LON', 'AU-SYD'];
const TRANSACTION_TYPES: Array<'purchase' | 'refund' | 'transfer'> = ['purchase', 'refund', 'transfer'];
const DEVICES: Array<'mobile' | 'desktop' | 'tablet'> = ['mobile', 'desktop', 'tablet'];

let eventCounter = 0;
let isRunning = false;
let producerInterval: NodeJS.Timeout | null = null;

// Generate realistic transaction event
function generateEvent(injectAnomaly = false): TransactionEvent {
    eventCounter++;

    const region = injectAnomaly
        ? 'ID-JB' // Concentrate anomalies in one region
        : REGIONS[Math.floor(Math.random() * REGIONS.length)];

    const baseAmount = 100;
    const amount = injectAnomaly
        ? baseAmount * (5 + Math.random() * 10) // 5-15x normal for anomaly
        : baseAmount * (0.5 + Math.random() * 2); // 0.5-2.5x normal

    return {
        id: `txn_${Date.now()}_${eventCounter}`,
        timestamp: new Date().toISOString(),
        region,
        amount: Math.round(amount * 100) / 100,
        user_id: `user_${Math.floor(Math.random() * 10000)}`,
        type: TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)],
        metadata: {
            device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        }
    };
}

// Start producing events
export async function startProducer(): Promise<void> {
    if (isRunning) {
        logger.warn('Producer is already running');
        return;
    }

    await producer.connect();
    logger.info('✅ Kafka producer connected');

    isRunning = true;
    let eventsSent = 0;

    producerInterval = setInterval(async () => {
        try {
            // Inject anomaly every 50-100 events (simulate spike)
            const shouldInjectAnomaly = eventsSent > 0 && eventsSent % 75 === 0;

            // If injecting anomaly, send burst of events
            const eventsToSend = shouldInjectAnomaly ? 15 : 1;

            for (let i = 0; i < eventsToSend; i++) {
                const event = generateEvent(shouldInjectAnomaly);

                await producer.send({
                    topic: process.env.KAFKA_TOPIC || 'transaction-events',
                    messages: [
                        {
                            key: event.region,
                            value: JSON.stringify(event),
                            timestamp: Date.now().toString()
                        }
                    ]
                });

                eventsSent++;
            }

            if (shouldInjectAnomaly) {
                logger.warn(`🚨 Injected anomaly burst: ${eventsToSend} events from ID-JB`);
            } else {
                logger.debug(`📤 Sent event ${eventsSent}`);
            }

        } catch (error) {
            logger.error('Error sending event:', error);
        }
    }, 1000 + Math.random() * 2000); // Random interval 1-3 seconds

    logger.info('🎬 Producer started - generating events...');
}

// Stop producing events
export async function stopProducer(): Promise<void> {
    if (!isRunning) {
        logger.warn('Producer is not running');
        return;
    }

    if (producerInterval) {
        clearInterval(producerInterval);
        producerInterval = null;
    }

    await producer.disconnect();
    isRunning = false;
    logger.info('⏹️  Producer stopped');
}

// Run as standalone script
if (require.main === module) {
    startProducer().catch((error) => {
        logger.error('Failed to start producer:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        await stopProducer();
        process.exit(0);
    });
}
