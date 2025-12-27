#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Example usage script for analyze-events function
 * 
 * Usage:
 *   deno run --allow-net --allow-env example.ts
 * 
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Your service role key
 */

import * as dotenv from 'https://deno.land/std@0.168.0/dotenv/mod.ts'

// Load environment variables
const env = await dotenv.load()
const SUPABASE_URL = env.SUPABASE_URL || Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables')
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    Deno.exit(1)
}

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/analyze-events`

// Helper function to call the analyze-events function
async function analyzeEvents(params: {
    organization_id: string
    period_start: string
    period_end: string
    metric_type?: string
    threshold_sensitivity?: string
}) {
    console.log('\n📊 Analyzing events...')
    console.log('Parameters:', JSON.stringify(params, null, 2))

    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify(params)
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('❌ Error:', data.error)
        return null
    }

    return data
}

// Helper function to print results
function printResults(data: any) {
    if (!data) return

    console.log('\n' + '='.repeat(80))
    console.log('📈 ANALYSIS RESULTS')
    console.log('='.repeat(80))

    const { insight, analysis } = data

    // Status
    const statusEmoji = insight.status === 'ANOMALY' ? '🚨' : '✅'
    const severityColor = {
        'HIGH': '\x1b[31m',    // Red
        'MEDIUM': '\x1b[33m',  // Yellow
        'LOW': '\x1b[32m',     // Green
    }
    const reset = '\x1b[0m'

    console.log(`\n${statusEmoji} Status: ${severityColor[insight.severity]}${insight.status} (${insight.severity} severity)${reset}`)
    console.log(`📝 Summary: ${insight.summary}`)
    console.log(`🎯 Confidence: ${(analysis.confidence * 100).toFixed(1)}%`)

    // Metrics
    console.log('\n📊 Statistical Metrics:')
    console.log(`   Events Analyzed: ${analysis.metrics.totalEvents}`)
    console.log(`   Mean: ${analysis.metrics.mean.toFixed(2)}`)
    console.log(`   Median: ${analysis.metrics.median.toFixed(2)}`)
    console.log(`   Std Dev: ${analysis.metrics.stdDev.toFixed(2)}`)
    console.log(`   Max Z-Score: ${analysis.metrics.maxZScore.toFixed(2)}`)
    console.log(`   Anomalies: ${analysis.metrics.anomalyCount} (${((analysis.metrics.anomalyCount / analysis.metrics.totalEvents) * 100).toFixed(1)}%)`)

    // Percentiles
    console.log('\n📈 Percentile Distribution:')
    const p = analysis.metrics.percentileData
    console.log(`   P25: ${p.p25.toFixed(2)} | P50: ${p.p50.toFixed(2)} | P75: ${p.p75.toFixed(2)}`)
    console.log(`   P90: ${p.p90.toFixed(2)} | P95: ${p.p95.toFixed(2)} | P99: ${p.p99.toFixed(2)}`)

    // Regional Distribution
    if (Object.keys(analysis.metrics.regionalDistribution).length > 0) {
        console.log('\n🌍 Regional Distribution:')
        const regions = Object.entries(analysis.metrics.regionalDistribution)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5)

        regions.forEach(([region, count]: any) => {
            const percentage = ((count / analysis.metrics.totalEvents) * 100).toFixed(1)
            const bar = '█'.repeat(Math.floor(percentage / 2))
            console.log(`   ${region.padEnd(15)} ${bar} ${count} (${percentage}%)`)
        })
    }

    // Event Types
    if (Object.keys(analysis.metrics.typeDistribution).length > 0) {
        console.log('\n📋 Event Type Distribution:')
        const types = Object.entries(analysis.metrics.typeDistribution)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5)

        types.forEach(([type, count]: any) => {
            const percentage = ((count / analysis.metrics.totalEvents) * 100).toFixed(1)
            console.log(`   ${type.padEnd(20)} ${count} (${percentage}%)`)
        })
    }

    // Possible Causes
    if (insight.possible_causes.length > 0) {
        console.log('\n🔍 Possible Causes:')
        insight.possible_causes.forEach((cause: string, i: number) => {
            console.log(`   ${i + 1}. ${cause}`)
        })
    }

    // Recommended Action
    if (insight.recommended_action) {
        console.log(`\n💡 Recommended Action:`)
        console.log(`   ${insight.recommended_action}`)
    }

    // Detailed Insights
    if (insight.detailed_insights && insight.detailed_insights.length > 0) {
        console.log('\n📌 Detailed Insights:')
        insight.detailed_insights.forEach((detail: string) => {
            console.log(`   • ${detail}`)
        })
    }

    // Affected Regions
    if (insight.affected_regions && insight.affected_regions.length > 0) {
        console.log(`\n⚠️  Affected Regions: ${insight.affected_regions.join(', ')}`)
    }

    // Affected Event Types
    if (insight.affected_event_types && insight.affected_event_types.length > 0) {
        console.log(`⚠️  Affected Event Types: ${insight.affected_event_types.join(', ')}`)
    }

    console.log('\n' + '='.repeat(80) + '\n')
}

// Example 1: Basic analysis (last 24 hours)
async function example1() {
    console.log('\n🔹 Example 1: Basic Analysis (Last 24 Hours)')

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const result = await analyzeEvents({
        organization_id: '123e4567-e89b-12d3-a456-426614174000', // Replace with your org ID
        period_start: yesterday.toISOString(),
        period_end: now.toISOString()
    })

    printResults(result)
}

// Example 2: High sensitivity analysis
async function example2() {
    console.log('\n🔹 Example 2: High Sensitivity Analysis')

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const result = await analyzeEvents({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: oneHourAgo.toISOString(),
        period_end: now.toISOString(),
        threshold_sensitivity: 'high'
    })

    printResults(result)
}

// Example 3: Transaction amount analysis
async function example3() {
    console.log('\n🔹 Example 3: Transaction Amount Analysis')

    const now = new Date()
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)

    const result = await analyzeEvents({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: sixHoursAgo.toISOString(),
        period_end: now.toISOString(),
        metric_type: 'transaction_amount',
        threshold_sensitivity: 'medium'
    })

    printResults(result)
}

// Example 4: Weekly analysis
async function example4() {
    console.log('\n🔹 Example 4: Weekly Analysis')

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const result = await analyzeEvents({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        period_start: oneWeekAgo.toISOString(),
        period_end: now.toISOString(),
        metric_type: 'transaction_volume',
        threshold_sensitivity: 'low'
    })

    printResults(result)
}

// Main execution
async function main() {
    console.log('🚀 Analyze Events - Example Usage')
    console.log('='.repeat(80))

    // Run examples (uncomment the ones you want to run)
    await example1()
    // await example2()
    // await example3()
    // await example4()

    console.log('✅ Examples completed!')
}

// Run if this is the main module
if (import.meta.main) {
    main().catch(console.error)
}
