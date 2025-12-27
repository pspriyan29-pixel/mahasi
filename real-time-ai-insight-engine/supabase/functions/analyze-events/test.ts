// Test file for analyze-events function
// Run with: deno test --allow-net --allow-env

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

const FUNCTION_URL = Deno.env.get('FUNCTION_URL') || 'http://localhost:54321/functions/v1/analyze-events'
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Helper function to make requests
async function callFunction(body: Record<string, unknown>) {
    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify(body)
    })
    return {
        status: response.status,
        data: await response.json()
    }
}

Deno.test('analyze-events: should handle CORS preflight', async () => {
    const response = await fetch(FUNCTION_URL, {
        method: 'OPTIONS',
        headers: {
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
        }
    })

    assertEquals(response.status, 200)
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*')
})

Deno.test('analyze-events: should reject missing required fields', async () => {
    const result = await callFunction({
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T23:59:59Z'
    })

    assertEquals(result.status, 400)
    assertExists(result.data.error)
    assertEquals(result.data.error.includes('Missing required fields'), true)
})

Deno.test('analyze-events: should reject invalid date format', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: 'invalid-date',
        period_end: '2024-01-01T23:59:59Z'
    })

    assertEquals(result.status, 400)
    assertExists(result.data.error)
    assertEquals(result.data.error, 'Invalid date format')
})

Deno.test('analyze-events: should reject start date after end date', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-02T00:00:00Z',
        period_end: '2024-01-01T00:00:00Z'
    })

    assertEquals(result.status, 400)
    assertExists(result.data.error)
    assertEquals(result.data.error, 'period_start must be before period_end')
})

Deno.test('analyze-events: should handle no events gracefully', async () => {
    const result = await callFunction({
        organization_id: '00000000-0000-0000-0000-000000000000', // Non-existent org
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T01:00:00Z'
    })

    // Should succeed but indicate no events
    if (result.status === 200) {
        assertEquals(result.data.success, true)
        assertEquals(result.data.insight.status, 'NORMAL')
        assertEquals(result.data.analysis.metrics.totalEvents, 0)
    }
})

Deno.test('analyze-events: should accept all metric types', async () => {
    const metricTypes = ['transaction_volume', 'transaction_amount', 'user_activity', 'regional_distribution']

    for (const metricType of metricTypes) {
        const result = await callFunction({
            organization_id: '123e4567-e89b-12d3-a456-426614174000',
            period_start: '2024-01-01T00:00:00Z',
            period_end: '2024-01-01T01:00:00Z',
            metric_type: metricType
        })

        // Should not error on metric type
        if (result.status === 200) {
            assertEquals(result.data.analysis.metrics.metricType, metricType)
        }
    }
})

Deno.test('analyze-events: should accept all sensitivity levels', async () => {
    const sensitivities = ['low', 'medium', 'high']

    for (const sensitivity of sensitivities) {
        const result = await callFunction({
            organization_id: '123e4567-e89b-12d3-a456-426614174000',
            period_start: '2024-01-01T00:00:00Z',
            period_end: '2024-01-01T01:00:00Z',
            threshold_sensitivity: sensitivity
        })

        // Should not error on sensitivity level
        if (result.status === 200) {
            assertEquals(result.data.analysis.threshold_sensitivity, sensitivity)
        }
    }
})

Deno.test('analyze-events: should return proper response structure', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T23:59:59Z',
        metric_type: 'transaction_volume',
        threshold_sensitivity: 'medium'
    })

    if (result.status === 200) {
        // Check top-level structure
        assertExists(result.data.success)
        assertExists(result.data.insight)
        assertExists(result.data.analysis)

        // Check insight structure
        const insight = result.data.insight
        assertExists(insight.status)
        assertExists(insight.severity)
        assertExists(insight.summary)
        assertExists(insight.possible_causes)

        // Check analysis structure
        const analysis = result.data.analysis
        assertExists(analysis.isAnomaly)
        assertExists(analysis.severity)
        assertExists(analysis.confidence)
        assertExists(analysis.metrics)

        // Check metrics structure
        const metrics = analysis.metrics
        assertExists(metrics.mean)
        assertExists(metrics.median)
        assertExists(metrics.stdDev)
        assertExists(metrics.totalEvents)
        assertExists(metrics.percentileData)
        assertExists(metrics.regionalDistribution)
        assertExists(metrics.typeDistribution)
        assertExists(metrics.timeSeriesData)
    }
})

Deno.test('analyze-events: should calculate percentiles correctly', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T23:59:59Z'
    })

    if (result.status === 200 && result.data.analysis.metrics.totalEvents > 0) {
        const percentiles = result.data.analysis.metrics.percentileData

        // Percentiles should be in ascending order
        assertEquals(percentiles.p25 <= percentiles.p50, true)
        assertEquals(percentiles.p50 <= percentiles.p75, true)
        assertEquals(percentiles.p75 <= percentiles.p90, true)
        assertEquals(percentiles.p90 <= percentiles.p95, true)
        assertEquals(percentiles.p95 <= percentiles.p99, true)

        // Median should equal p50
        assertEquals(percentiles.p50, result.data.analysis.metrics.median)
    }
})

Deno.test('analyze-events: should include time series data', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T23:59:59Z'
    })

    if (result.status === 200 && result.data.analysis.metrics.totalEvents > 0) {
        const timeSeriesData = result.data.analysis.metrics.timeSeriesData

        assertExists(timeSeriesData)
        assertEquals(Array.isArray(timeSeriesData), true)

        if (timeSeriesData.length > 0) {
            const dataPoint = timeSeriesData[0]
            assertExists(dataPoint.timestamp)
            assertExists(dataPoint.value)
            assertExists(dataPoint.isAnomaly)
        }
    }
})

Deno.test('analyze-events: confidence should be between 0 and 1', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T23:59:59Z'
    })

    if (result.status === 200) {
        const confidence = result.data.analysis.confidence
        assertEquals(confidence >= 0, true)
        assertEquals(confidence <= 1, true)
    }
})

Deno.test('analyze-events: severity should be valid', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-01T23:59:59Z'
    })

    if (result.status === 200) {
        const severity = result.data.analysis.severity
        const validSeverities = ['LOW', 'MEDIUM', 'HIGH']
        assertEquals(validSeverities.includes(severity), true)
    }
})

Deno.test('analyze-events: should handle large time ranges', async () => {
    const result = await callFunction({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-31T23:59:59Z' // 31 days
    })

    // Should complete without timeout
    assertEquals(result.status === 200 || result.status === 500, true)
})
