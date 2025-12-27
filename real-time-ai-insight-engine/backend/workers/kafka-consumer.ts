import { kafka, supabase, genAI, config, healthCheck } from './config'
import logger from './logger'

interface Event {
    organization_id: string
    event_id: string
    timestamp: string
    event_type: string
    region?: string
    amount?: number
    user_id?: string
    device?: string
    metadata?: Record<string, any>
}

interface Analysis {
    isAnomaly: boolean
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    metrics: {
        mean: number
        stdDev: number
        maxZScore: number
        anomalyCount: number
        totalEvents: number
        metricType: string
    }
}

// Event buffer for batch processing
const eventBuffer: Map<string, Event[]> = new Map()

async function processEvent(event: Event): Promise<void> {
    try {
        const { organization_id, event_id, timestamp, event_type, region, amount, user_id, device, metadata } = event

        // Insert event into Supabase
        const { error } = await supabase.from('events').insert({
            organization_id,
            event_id,
            timestamp: new Date(timestamp).toISOString(),
            event_type,
            region,
            amount,
            user_id,
            device,
            metadata: metadata || {},
        })

        if (error) {
            logger.error('Error inserting event:', { error, event_id })
            return
        }

        // Add to buffer for analysis
        if (!eventBuffer.has(organization_id)) {
            eventBuffer.set(organization_id, [])
        }

        const buffer = eventBuffer.get(organization_id)!
        buffer.push(event)

        // Trigger analysis if buffer is full
        if (buffer.length >= config.kafka.bufferSize) {
            await analyzeEvents(organization_id, buffer)
            eventBuffer.set(organization_id, [])
        }

        logger.debug('Processed event', { event_id, organization_id })
    } catch (error) {
        logger.error('Error processing event:', { error, event })
    }
}

async function analyzeEvents(organizationId: string, events: Event[]): Promise<void> {
    try {
        logger.info(`Analyzing ${events.length} events for organization ${organizationId}`)

        // Calculate statistics
        const amounts = events.map(e => e.amount || 0)
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
        const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
        const stdDev = Math.sqrt(variance)

        // Detect anomalies
        const zScores = amounts.map(v => Math.abs((v - mean) / stdDev))
        const maxZScore = Math.max(...zScores)
        const anomalyCount = zScores.filter(z => z > config.analysis.zScoreThreshold).length

        const isAnomaly = maxZScore > config.analysis.zScoreThreshold ||
            anomalyCount > amounts.length * config.analysis.anomalyPercentage

        let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
        if (maxZScore > config.analysis.highSeverityThreshold ||
            anomalyCount > amounts.length * 0.2) {
            severity = 'HIGH'
        } else if (maxZScore > config.analysis.mediumSeverityThreshold ||
            anomalyCount > amounts.length * 0.15) {
            severity = 'MEDIUM'
        }

        const analysis: Analysis = {
            isAnomaly,
            severity,
            metrics: {
                mean,
                stdDev,
                maxZScore,
                anomalyCount,
                totalEvents: events.length,
                metricType: 'transaction_volume',
            },
        }

        // Get AI explanation
        const aiExplanation = await getAIExplanation(analysis, events)

        // Store insight
        const { data: insight, error } = await supabase
            .from('ai_insights')
            .insert({
                organization_id: organizationId,
                status: isAnomaly ? 'ANOMALY' : 'NORMAL',
                severity,
                summary: aiExplanation.summary,
                possible_causes: aiExplanation.possible_causes,
                recommended_action: aiExplanation.recommended_action,
                analyzed_period_start: events[0].timestamp,
                analyzed_period_end: events[events.length - 1].timestamp,
                metrics: analysis.metrics,
            })
            .select()
            .single()

        if (error) {
            logger.error('Error storing insight:', { error, organizationId })
            return
        }

        logger.info('Insight created', {
            insight_id: insight.id,
            status: insight.status,
            severity: insight.severity
        })

        // Create alert if anomaly
        if (isAnomaly) {
            const { error: alertError } = await supabase.from('alerts').insert({
                organization_id: organizationId,
                insight_id: insight.id,
                title: `Anomaly Detected: ${aiExplanation.summary}`,
                description: aiExplanation.possible_causes.join('. '),
                status: 'open',
                severity,
            })

            if (alertError) {
                logger.error('Error creating alert:', { error: alertError, organizationId })
            } else {
                logger.warn('Alert created for anomaly', { organizationId, severity })
            }
        }
    } catch (error) {
        logger.error('Error analyzing events:', { error, organizationId })
    }
}

async function getAIExplanation(analysis: Analysis, events: Event[]): Promise<{
    summary: string
    possible_causes: string[]
    recommended_action: string | null
}> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Analyze this transaction data and provide insights:

Total Events: ${analysis.metrics.totalEvents}
Mean: ${analysis.metrics.mean.toFixed(2)}
Standard Deviation: ${analysis.metrics.stdDev.toFixed(2)}
Max Z-Score: ${analysis.metrics.maxZScore.toFixed(2)}
Anomaly Count: ${analysis.metrics.anomalyCount}
Is Anomaly: ${analysis.isAnomaly}
Severity: ${analysis.severity}

Recent events sample: ${JSON.stringify(events.slice(-5))}

Provide a JSON response with:
1. summary: Brief explanation (1 sentence)
2. possible_causes: Array of 2-3 possible causes
3. recommended_action: Specific action to take (or null if normal)

Keep it concise and actionable. Return ONLY valid JSON.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            logger.debug('AI explanation generated', { summary: parsed.summary })
            return parsed
        }

        throw new Error('Failed to parse AI response')
    } catch (error) {
        logger.error('AI explanation error:', error)
        return {
            summary: analysis.isAnomaly ? 'Anomaly detected in transaction patterns' : 'Normal transaction pattern',
            possible_causes: analysis.isAnomaly
                ? ['Statistical deviation detected', 'Unusual transaction volume']
                : [],
            recommended_action: analysis.isAnomaly
                ? 'Review recent transactions and investigate unusual patterns'
                : null,
        }
    }
}

async function startConsumer(): Promise<void> {
    // Check if Kafka is configured
    if (!kafka) {
        logger.error('Kafka is not configured. Please set KAFKA_BOOTSTRAP_SERVERS in environment variables.')
        process.exit(1)
    }

    // Health check first
    const healthy = await healthCheck()
    if (!healthy) {
        logger.error('Health check failed, exiting...')
        process.exit(1)
    }

    const consumer = kafka.consumer({ groupId: config.kafka.groupId })

    await consumer.connect()
    logger.info('Kafka consumer connected')

    await consumer.subscribe({ topic: config.kafka.topic, fromBeginning: false })
    logger.info(`Subscribed to topic: ${config.kafka.topic}`)

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const event = JSON.parse(message.value?.toString() || '{}')
                await processEvent(event)
            } catch (error) {
                logger.error('Error processing message:', { error, topic, partition })
            }
        },
    })

    // Periodic buffer flush
    setInterval(() => {
        eventBuffer.forEach((buffer, orgId) => {
            if (buffer.length > 0) {
                logger.info(`Flushing buffer for org ${orgId} (${buffer.length} events)`)
                analyzeEvents(orgId, buffer)
                eventBuffer.set(orgId, [])
            }
        })
    }, config.kafka.bufferTimeout)

    logger.info('Kafka consumer worker started successfully')
}

// Start the consumer
startConsumer().catch((error) => {
    logger.error('Fatal error starting consumer:', error)
    process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...')

    // Flush remaining buffers
    for (const [orgId, buffer] of eventBuffer.entries()) {
        if (buffer.length > 0) {
            logger.info(`Flushing final buffer for org ${orgId}`)
            await analyzeEvents(orgId, buffer)
        }
    }

    process.exit(0)
})

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...')

    // Flush remaining buffers
    for (const [orgId, buffer] of eventBuffer.entries()) {
        if (buffer.length > 0) {
            logger.info(`Flushing final buffer for org ${orgId}`)
            await analyzeEvents(orgId, buffer)
        }
    }

    process.exit(0)
})
