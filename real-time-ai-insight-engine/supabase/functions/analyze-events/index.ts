/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types
interface AnalysisRequest {
    organization_id: string
    period_start: string
    period_end: string
    metric_type?: 'transaction_volume' | 'transaction_amount' | 'user_activity' | 'regional_distribution'
    threshold_sensitivity?: 'low' | 'medium' | 'high'
}

interface Event {
    id: string
    organization_id: string
    event_id: string
    timestamp: string
    event_type: string
    region: string
    amount: number
    user_id: string
    device: string
    metadata: Record<string, unknown>
}

interface AnomalyAnalysis {
    isAnomaly: boolean
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    confidence: number
    metrics: {
        mean: number
        median: number
        stdDev: number
        maxZScore: number
        anomalyCount: number
        totalEvents: number
        metricType: string
        percentileData: {
            p25: number
            p50: number
            p75: number
            p90: number
            p95: number
            p99: number
        }
        regionalDistribution: Record<string, number>
        typeDistribution: Record<string, number>
        timeSeriesData: Array<{
            timestamp: string
            value: number
            isAnomaly: boolean
        }>
    }
}

interface AIExplanation {
    summary: string
    possible_causes: string[]
    recommended_action: string | null
    detailed_insights?: string[]
    affected_regions?: string[]
    affected_event_types?: string[]
}

// Main handler
serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Validate environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables')
        }

        // Initialize Supabase client
        const supabaseClient = createClient(supabaseUrl, supabaseKey)

        // Parse request body with error handling
        let requestData: AnalysisRequest
        try {
            requestData = await req.json()
        } catch (parseError) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid JSON in request body',
                    details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        const {
            organization_id,
            period_start,
            period_end,
            metric_type = 'transaction_volume',
            threshold_sensitivity = 'medium'
        } = requestData

        // Validate required fields
        if (!organization_id || !period_start || !period_end) {
            return new Response(
                JSON.stringify({
                    error: 'Missing required fields',
                    required: ['organization_id', 'period_start', 'period_end'],
                    received: {
                        organization_id: !!organization_id,
                        period_start: !!period_start,
                        period_end: !!period_end
                    }
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Validate date format
        const startDate = new Date(period_start)
        const endDate = new Date(period_end)

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)',
                    received: { period_start, period_end }
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        if (startDate >= endDate) {
            return new Response(
                JSON.stringify({
                    error: 'period_start must be before period_end',
                    received: { period_start, period_end }
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Validate metric_type
        const validMetricTypes = ['transaction_volume', 'transaction_amount', 'user_activity', 'regional_distribution']
        if (!validMetricTypes.includes(metric_type)) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid metric_type',
                    valid_types: validMetricTypes,
                    received: metric_type
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Validate threshold_sensitivity
        const validSensitivities = ['low', 'medium', 'high']
        if (!validSensitivities.includes(threshold_sensitivity)) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid threshold_sensitivity',
                    valid_values: validSensitivities,
                    received: threshold_sensitivity
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        console.log(`Starting analysis for organization ${organization_id} from ${period_start} to ${period_end}`)

        // Fetch events for analysis
        const { data: events, error: eventsError } = await supabaseClient
            .from('events')
            .select('*')
            .eq('organization_id', organization_id)
            .gte('timestamp', period_start)
            .lte('timestamp', period_end)
            .order('timestamp', { ascending: true })

        if (eventsError) {
            console.error('Error fetching events:', eventsError)
            throw new Error(`Failed to fetch events: ${eventsError.message}`)
        }

        // Handle no events case
        if (!events || events.length === 0) {
            console.log('No events found in specified period')

            const emptyInsight = {
                status: 'NORMAL',
                severity: 'LOW',
                confidence: 1.0,
                summary: 'No events found in the specified period',
                possible_causes: ['No activity during this time period'],
                recommended_action: null,
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    insight: emptyInsight,
                    analysis: {
                        isAnomaly: false,
                        severity: 'LOW',
                        confidence: 1.0,
                        metrics: {
                            totalEvents: 0,
                            metricType: metric_type,
                            mean: 0,
                            median: 0,
                            stdDev: 0,
                            maxZScore: 0,
                            anomalyCount: 0,
                            percentileData: {
                                p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p99: 0
                            },
                            regionalDistribution: {},
                            typeDistribution: {},
                            timeSeriesData: []
                        }
                    }
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        console.log(`Analyzing ${events.length} events`)

        // Perform comprehensive statistical analysis
        const analysis = performAdvancedAnomalyDetection(
            events as Event[],
            metric_type,
            threshold_sensitivity
        )

        console.log(`Analysis complete: ${analysis.isAnomaly ? 'ANOMALY' : 'NORMAL'} - Severity: ${analysis.severity}`)

        // Get AI-powered explanation
        const aiExplanation = await getEnhancedAIExplanation(
            analysis,
            events as Event[],
            metric_type
        )

        // Store insight in database with error handling
        const { data: insight, error: insightError } = await supabaseClient
            .from('ai_insights')
            .insert({
                organization_id,
                status: analysis.isAnomaly ? 'ANOMALY' : 'NORMAL',
                severity: analysis.severity,
                summary: aiExplanation.summary,
                possible_causes: aiExplanation.possible_causes,
                recommended_action: aiExplanation.recommended_action,
                analyzed_period_start: period_start,
                analyzed_period_end: period_end,
                metrics: analysis.metrics,
            })
            .select()
            .single()

        if (insightError) {
            console.error('Error storing insight:', insightError)
            throw new Error(`Failed to store insight: ${insightError.message}`)
        }

        console.log(`Insight stored with ID: ${insight.id}`)

        // Create alert if anomaly detected with sufficient confidence
        if (analysis.isAnomaly && analysis.confidence > 0.7) {
            const alertTitle = `${analysis.severity} Severity Anomaly: ${aiExplanation.summary.substring(0, 100)}`
            const alertDescription = [
                ...aiExplanation.possible_causes,
                aiExplanation.recommended_action ? `Action: ${aiExplanation.recommended_action}` : ''
            ].filter(Boolean).join('. ')

            const { error: alertError } = await supabaseClient
                .from('alerts')
                .insert({
                    organization_id,
                    insight_id: insight.id,
                    title: alertTitle,
                    description: alertDescription,
                    status: 'open',
                    severity: analysis.severity,
                })

            if (alertError) {
                console.error('Error creating alert:', alertError)
                // Don't throw error, just log it
            } else {
                console.log(`Alert created for ${analysis.severity} severity anomaly`)
            }
        }

        // Return successful response
        return new Response(
            JSON.stringify({
                success: true,
                insight: {
                    ...insight,
                    detailed_insights: aiExplanation.detailed_insights,
                    affected_regions: aiExplanation.affected_regions,
                    affected_event_types: aiExplanation.affected_event_types,
                },
                analysis: {
                    ...analysis,
                    threshold_sensitivity,
                    events_analyzed: events.length,
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    } catch (error) {
        console.error('Analysis error:', error)

        // Provide detailed error information
        const errorResponse = {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            error_type: error instanceof Error ? error.name : 'UnknownError',
            timestamp: new Date().toISOString(),
            stack: error instanceof Error ? error.stack : undefined
        }

        return new Response(
            JSON.stringify(errorResponse),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})

// Advanced anomaly detection with multiple statistical methods
function performAdvancedAnomalyDetection(
    events: Event[],
    metricType: string,
    sensitivity: 'low' | 'medium' | 'high'
): AnomalyAnalysis {
    // Extract values based on metric type
    const values = events.map(e => {
        switch (metricType) {
            case 'transaction_amount':
                return typeof e.amount === 'number' ? e.amount : 0
            case 'transaction_volume':
                return 1 // Count each event
            case 'user_activity':
                return 1 // Count each user activity
            case 'regional_distribution':
                return 1 // Count by region
            default:
                return typeof e.amount === 'number' ? e.amount : 0
        }
    })

    // Handle edge case of all zero values
    if (values.every(v => v === 0)) {
        return createEmptyAnalysis(events, metricType)
    }

    // Calculate comprehensive statistics
    const sortedValues = [...values].sort((a, b) => a - b)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const median = calculatePercentile(sortedValues, 50)
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Calculate percentiles
    const percentileData = {
        p25: calculatePercentile(sortedValues, 25),
        p50: calculatePercentile(sortedValues, 50),
        p75: calculatePercentile(sortedValues, 75),
        p90: calculatePercentile(sortedValues, 90),
        p95: calculatePercentile(sortedValues, 95),
        p99: calculatePercentile(sortedValues, 99),
    }

    // Detect anomalies using multiple methods
    // Prevent division by zero
    const effectiveStdDev = stdDev === 0 ? 1 : stdDev
    const zScores = values.map(v => Math.abs((v - mean) / effectiveStdDev))
    const maxZScore = Math.max(...zScores)

    // IQR method for outlier detection
    const iqr = percentileData.p75 - percentileData.p25
    const lowerBound = percentileData.p25 - 1.5 * iqr
    const upperBound = percentileData.p75 + 1.5 * iqr
    const iqrOutliers = values.filter(v => v < lowerBound || v > upperBound).length

    // Adjust thresholds based on sensitivity
    const thresholds = {
        low: { zScore: 4, anomalyRatio: 0.15 },
        medium: { zScore: 3, anomalyRatio: 0.10 },
        high: { zScore: 2, anomalyRatio: 0.05 },
    }

    const threshold = thresholds[sensitivity]
    const anomalyCount = zScores.filter(z => z > threshold.zScore).length
    const anomalyRatio = values.length > 0 ? anomalyCount / values.length : 0

    // Determine if anomaly exists
    const isAnomaly = maxZScore > threshold.zScore ||
        anomalyRatio > threshold.anomalyRatio ||
        (values.length > 0 && iqrOutliers > values.length * 0.1)

    // Calculate confidence score (0-1)
    const confidence = Math.min(
        1.0,
        Math.max(0, (maxZScore / 10) * 0.5 + (anomalyRatio / 0.2) * 0.5)
    )

    // Determine severity
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    if (maxZScore > 5 || anomalyRatio > 0.2) {
        severity = 'HIGH'
    } else if (maxZScore > 4 || anomalyRatio > 0.15) {
        severity = 'MEDIUM'
    }

    // Regional distribution analysis
    const regionalDistribution: Record<string, number> = {}
    events.forEach(e => {
        const region = e.region || 'unknown'
        regionalDistribution[region] = (regionalDistribution[region] || 0) + 1
    })

    // Event type distribution
    const typeDistribution: Record<string, number> = {}
    events.forEach(e => {
        const eventType = e.event_type || 'unknown'
        typeDistribution[eventType] = (typeDistribution[eventType] || 0) + 1
    })

    // Time series analysis (group by hour)
    const timeSeriesData = groupByTimeWindow(events, values, zScores, threshold.zScore)

    return {
        isAnomaly,
        severity,
        confidence: Math.round(confidence * 100) / 100,
        metrics: {
            mean: Math.round(mean * 100) / 100,
            median: Math.round(median * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
            maxZScore: Math.round(maxZScore * 100) / 100,
            anomalyCount,
            totalEvents: events.length,
            metricType,
            percentileData: {
                p25: Math.round(percentileData.p25 * 100) / 100,
                p50: Math.round(percentileData.p50 * 100) / 100,
                p75: Math.round(percentileData.p75 * 100) / 100,
                p90: Math.round(percentileData.p90 * 100) / 100,
                p95: Math.round(percentileData.p95 * 100) / 100,
                p99: Math.round(percentileData.p99 * 100) / 100,
            },
            regionalDistribution,
            typeDistribution,
            timeSeriesData,
        },
    }
}

// Create empty analysis for edge cases
function createEmptyAnalysis(events: Event[], metricType: string): AnomalyAnalysis {
    return {
        isAnomaly: false,
        severity: 'LOW',
        confidence: 0,
        metrics: {
            mean: 0,
            median: 0,
            stdDev: 0,
            maxZScore: 0,
            anomalyCount: 0,
            totalEvents: events.length,
            metricType,
            percentileData: {
                p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p99: 0
            },
            regionalDistribution: {},
            typeDistribution: {},
            timeSeriesData: []
        }
    }
}

// Calculate percentile
function calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0
    if (sortedValues.length === 1) return sortedValues[0]

    const index = (percentile / 100) * (sortedValues.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower

    if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1]
    if (lower === upper) return sortedValues[lower]

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
}

// Group events by time window for time series analysis
function groupByTimeWindow(
    events: Event[],
    values: number[],
    zScores: number[],
    threshold: number
): Array<{ timestamp: string; value: number; isAnomaly: boolean }> {
    if (events.length === 0) return []

    const timeSeriesMap = new Map<string, { sum: number; count: number; anomalies: number }>()

    events.forEach((event, idx) => {
        try {
            const date = new Date(event.timestamp)
            if (isNaN(date.getTime())) {
                console.warn(`Invalid timestamp for event ${event.id}: ${event.timestamp}`)
                return
            }

            const hourKey = date.toISOString().substring(0, 13) + ':00:00'
            const existing = timeSeriesMap.get(hourKey) || { sum: 0, count: 0, anomalies: 0 }

            existing.sum += values[idx] || 0
            existing.count += 1
            if (zScores[idx] > threshold) existing.anomalies += 1

            timeSeriesMap.set(hourKey, existing)
        } catch (error) {
            console.error(`Error processing event ${event.id}:`, error)
        }
    })

    return Array.from(timeSeriesMap.entries())
        .map(([timestamp, data]) => ({
            timestamp,
            value: data.count > 0 ? Math.round((data.sum / data.count) * 100) / 100 : 0,
            isAnomaly: data.count > 0 && data.anomalies > data.count * 0.3,
        }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

// Enhanced AI explanation using Gemini
async function getEnhancedAIExplanation(
    analysis: AnomalyAnalysis,
    events: Event[],
    metricType: string
): Promise<AIExplanation> {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    // Fallback response if no API key
    if (!GEMINI_API_KEY) {
        console.log('No Gemini API key found, using fallback explanation')
        return generateFallbackExplanation(analysis, events, metricType)
    }

    try {
        // Prepare comprehensive analysis data
        const topRegions = Object.entries(analysis.metrics.regionalDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([region, count]) => `${region}: ${count} events (${Math.round(count / events.length * 100)}%)`)

        const topEventTypes = Object.entries(analysis.metrics.typeDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => `${type}: ${count} events`)

        const recentAnomalies = analysis.metrics.timeSeriesData
            .filter(d => d.isAnomaly)
            .slice(-5)

        const prompt = `Analyze this transaction data and provide detailed insights:

**Analysis Summary:**
- Total Events: ${analysis.metrics.totalEvents}
- Metric Type: ${metricType}
- Anomaly Detected: ${analysis.isAnomaly ? 'YES' : 'NO'}
- Severity: ${analysis.severity}
- Confidence: ${(analysis.confidence * 100).toFixed(1)}%

**Statistical Metrics:**
- Mean: ${analysis.metrics.mean.toFixed(2)}
- Median: ${analysis.metrics.median.toFixed(2)}
- Std Deviation: ${analysis.metrics.stdDev.toFixed(2)}
- Max Z-Score: ${analysis.metrics.maxZScore.toFixed(2)}
- Anomaly Count: ${analysis.metrics.anomalyCount} (${((analysis.metrics.anomalyCount / analysis.metrics.totalEvents) * 100).toFixed(1)}%)

**Percentile Distribution:**
- P25: ${analysis.metrics.percentileData.p25.toFixed(2)}
- P50 (Median): ${analysis.metrics.percentileData.p50.toFixed(2)}
- P75: ${analysis.metrics.percentileData.p75.toFixed(2)}
- P95: ${analysis.metrics.percentileData.p95.toFixed(2)}
- P99: ${analysis.metrics.percentileData.p99.toFixed(2)}

**Regional Distribution (Top 5):**
${topRegions.length > 0 ? topRegions.join('\n') : 'No regional data'}

**Event Types (Top 5):**
${topEventTypes.length > 0 ? topEventTypes.join('\n') : 'No event type data'}

**Recent Anomalous Time Windows:**
${recentAnomalies.length > 0 ? recentAnomalies.map(a => `${a.timestamp}: ${a.value}`).join('\n') : 'None detected'}

**Recent Events Sample:**
${JSON.stringify(events.slice(-3).map(e => ({
            timestamp: e.timestamp,
            type: e.event_type,
            region: e.region,
            amount: e.amount
        })), null, 2)}

Provide a comprehensive JSON response with:
{
  "summary": "Brief, actionable summary (max 200 chars)",
  "possible_causes": ["2-4 specific, data-driven causes"],
  "recommended_action": "Specific action to take (or null if normal)",
  "detailed_insights": ["3-5 detailed observations about the data patterns"],
  "affected_regions": ["regions with unusual activity"],
  "affected_event_types": ["event types showing anomalies"]
}

Be specific, use actual numbers from the data, and provide actionable insights.`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                }),
                signal: controller.signal
            }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Gemini API error ${response.status}:`, errorText)
            throw new Error(`Gemini API error: ${response.status}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text) {
            console.error('No text in Gemini response:', JSON.stringify(data))
            throw new Error('No response from Gemini API')
        }

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text.trim()
        if (jsonText.includes('```json')) {
            const match = jsonText.match(/```json\s*\n([\s\S]*?)\n\s*```/)
            jsonText = match ? match[1] : jsonText
        } else if (jsonText.includes('```')) {
            const match = jsonText.match(/```\s*\n([\s\S]*?)\n\s*```/)
            jsonText = match ? match[1] : jsonText
        }

        // Remove any leading/trailing whitespace
        jsonText = jsonText.trim()

        let aiResponse
        try {
            aiResponse = JSON.parse(jsonText)
        } catch (parseError) {
            console.error('Failed to parse Gemini JSON response:', jsonText)
            throw new Error('Invalid JSON response from Gemini API')
        }

        return {
            summary: aiResponse.summary || 'Analysis completed',
            possible_causes: Array.isArray(aiResponse.possible_causes) ? aiResponse.possible_causes : [],
            recommended_action: aiResponse.recommended_action || null,
            detailed_insights: Array.isArray(aiResponse.detailed_insights) ? aiResponse.detailed_insights : [],
            affected_regions: Array.isArray(aiResponse.affected_regions) ? aiResponse.affected_regions : [],
            affected_event_types: Array.isArray(aiResponse.affected_event_types) ? aiResponse.affected_event_types : [],
        }

    } catch (error) {
        console.error('AI explanation error:', error)
        return generateFallbackExplanation(analysis, events, metricType)
    }
}

// Generate fallback explanation without AI
function generateFallbackExplanation(
    analysis: AnomalyAnalysis,
    events: Event[],
    metricType: string
): AIExplanation {
    if (!analysis.isAnomaly) {
        return {
            summary: `Normal ${metricType} pattern detected across ${events.length} events`,
            possible_causes: ['Activity within expected range', 'No statistical outliers detected'],
            recommended_action: null,
            detailed_insights: [
                `Mean value: ${analysis.metrics.mean.toFixed(2)}`,
                `Standard deviation: ${analysis.metrics.stdDev.toFixed(2)}`,
                `All metrics within expected range`,
                `Analyzed ${events.length} events across ${Object.keys(analysis.metrics.regionalDistribution).length} regions`
            ],
            affected_regions: [],
            affected_event_types: [],
        }
    }

    // Find affected regions (those with unusual concentration)
    const totalEvents = events.length
    const affectedRegions = Object.entries(analysis.metrics.regionalDistribution)
        .filter(([, count]) => totalEvents > 0 && count / totalEvents > 0.4)
        .map(([region]) => region)

    // Find affected event types
    const affectedEventTypes = Object.entries(analysis.metrics.typeDistribution)
        .filter(([, count]) => totalEvents > 0 && count / totalEvents > 0.3)
        .map(([type]) => type)

    const anomalyPercentage = totalEvents > 0
        ? ((analysis.metrics.anomalyCount / totalEvents) * 100).toFixed(1)
        : '0.0'

    const causes = [
        `Statistical deviation detected (max z-score: ${analysis.metrics.maxZScore.toFixed(2)})`,
        `${metricType} values significantly differ from baseline (mean: ${analysis.metrics.mean.toFixed(2)}, stddev: ${analysis.metrics.stdDev.toFixed(2)})`
    ]

    if (affectedRegions.length > 0) {
        causes.splice(1, 0, `Unusual concentration in regions: ${affectedRegions.join(', ')}`)
    } else {
        causes.splice(1, 0, 'Distributed across multiple regions')
    }

    return {
        summary: `${analysis.severity} severity anomaly: ${analysis.metrics.anomalyCount} unusual events (${anomalyPercentage}%) detected`,
        possible_causes: causes,
        recommended_action: analysis.severity === 'HIGH'
            ? 'Immediate investigation required - review recent transactions and system logs'
            : analysis.severity === 'MEDIUM'
                ? 'Monitor closely and investigate if pattern continues'
                : 'Normal activity detected',
        detailed_insights: [
            `Analyzed ${totalEvents} events with ${analysis.metrics.anomalyCount} anomalies`,
            `95th percentile: ${analysis.metrics.percentileData.p95.toFixed(2)}`,
            `Regional distribution: ${Object.keys(analysis.metrics.regionalDistribution).length} regions`,
            `Event types: ${Object.keys(analysis.metrics.typeDistribution).length} different types`
        ],
        affected_regions: affectedRegions,
        affected_event_types: affectedEventTypes,
    }
}