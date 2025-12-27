import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Kafka } from 'kafkajs'

// Validate environment variables
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
]

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`)
        process.exit(1)
    }
}

// Initialize clients
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Kafka is optional
const kafka = process.env.KAFKA_BOOTSTRAP_SERVERS ? new Kafka({
    clientId: 'ai-insight-engine',
    brokers: process.env.KAFKA_BOOTSTRAP_SERVERS!.split(','),
    ssl: process.env.KAFKA_SSL === 'true',
    sasl: process.env.KAFKA_API_KEY
        ? {
            mechanism: 'plain',
            username: process.env.KAFKA_API_KEY,
            password: process.env.KAFKA_API_SECRET!,
        }
        : undefined,
}) : null

// Configuration
export const config = {
    kafka: {
        topic: process.env.KAFKA_TOPIC || 'events',
        groupId: process.env.KAFKA_GROUP_ID || 'ai-insight-engine',
        bufferSize: parseInt(process.env.BUFFER_SIZE || '100'),
        bufferTimeout: parseInt(process.env.BUFFER_TIMEOUT || '60000'),
    },
    analysis: {
        zScoreThreshold: parseFloat(process.env.Z_SCORE_THRESHOLD || '3'),
        anomalyPercentage: parseFloat(process.env.ANOMALY_PERCENTAGE || '0.1'),
        highSeverityThreshold: parseFloat(process.env.HIGH_SEVERITY_THRESHOLD || '5'),
        mediumSeverityThreshold: parseFloat(process.env.MEDIUM_SEVERITY_THRESHOLD || '4'),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
}

export { supabase, genAI, kafka }

// Health check
export async function healthCheck(): Promise<boolean> {
    try {
        // Check Supabase connection
        const { error: supabaseError } = await supabase.from('organizations').select('id').limit(1)
        if (supabaseError) {
            console.error('Supabase health check failed:', supabaseError)
            return false
        }

        // Check Kafka connection (if configured)
        if (kafka) {
            const admin = kafka.admin()
            await admin.connect()
            await admin.listTopics()
            await admin.disconnect()
        }

        console.log('✅ All services healthy')
        return true
    } catch (error) {
        console.error('❌ Health check failed:', error)
        return false
    }
}
