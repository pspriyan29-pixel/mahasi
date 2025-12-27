import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function runs on a schedule (e.g., every hour)
// Configure in Supabase Dashboard: Database > Cron Jobs

serve(async (_req) => {
    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log('Starting scheduled analysis job...')

        // Get all active organizations
        const { data: orgs, error: orgsError } = await supabaseClient
            .from('organizations')
            .select('id')
            .limit(100)

        if (orgsError) throw orgsError

        const results = []

        // Analyze events for each organization
        for (const org of orgs || []) {
            try {
                const endTime = new Date()
                const startTime = new Date(endTime.getTime() - 3600000) // Last hour

                // Check if there are events to analyze
                const { count } = await supabaseClient
                    .from('events')
                    .select('*', { count: 'exact', head: true })
                    .eq('organization_id', org.id)
                    .gte('timestamp', startTime.toISOString())
                    .lte('timestamp', endTime.toISOString())

                if (count && count > 10) {
                    // Trigger analysis
                    const { data, error } = await supabaseClient.functions.invoke(
                        'analyze-events',
                        {
                            body: {
                                organization_id: org.id,
                                period_start: startTime.toISOString(),
                                period_end: endTime.toISOString(),
                            },
                        }
                    )

                    if (error) {
                        console.error(`Analysis failed for org ${org.id}:`, error)
                        results.push({ org_id: org.id, status: 'failed', error: error.message })
                    } else {
                        console.log(`Analysis completed for org ${org.id}`)
                        results.push({ org_id: org.id, status: 'success', data })
                    }
                } else {
                    results.push({ org_id: org.id, status: 'skipped', reason: 'insufficient_events' })
                }
            } catch (error) {
                console.error(`Error processing org ${org.id}:`, error)
                results.push({ org_id: org.id, status: 'error', error: (error as Error).message })
            }
        }

        // Cleanup old data (optional)
        await cleanupOldData(supabaseClient)

        console.log('Scheduled analysis job completed')

        return new Response(
            JSON.stringify({
                success: true,
                processed: results.length,
                results,
                timestamp: new Date().toISOString(),
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            }
        )
    } catch (error) {
        console.error('Scheduled job error:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        )
    }
})

async function cleanupOldData(supabase: any) {
    try {
        // Delete events older than 90 days
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 90)

        const { error: eventsError } = await supabase
            .from('events')
            .delete()
            .lt('timestamp', cutoffDate.toISOString())

        if (eventsError) {
            console.error('Error cleaning up events:', eventsError)
        } else {
            console.log('Old events cleaned up successfully')
        }

        // Delete resolved alerts older than 30 days
        const alertCutoff = new Date()
        alertCutoff.setDate(alertCutoff.getDate() - 30)

        const { error: alertsError } = await supabase
            .from('alerts')
            .delete()
            .eq('status', 'resolved')
            .lt('resolved_at', alertCutoff.toISOString())

        if (alertsError) {
            console.error('Error cleaning up alerts:', alertsError)
        } else {
            console.log('Old alerts cleaned up successfully')
        }
    } catch (error) {
        console.error('Cleanup error:', error)
    }
}
