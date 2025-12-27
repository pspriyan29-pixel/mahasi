import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const { alert_id, action } = await req.json()

        if (!['acknowledge', 'resolve', 'ignore'].includes(action)) {
            return new Response(JSON.stringify({ error: 'Invalid action' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const updates: any = {}

        if (action === 'acknowledge') {
            updates.status = 'acknowledged'
            updates.acknowledged_at = new Date().toISOString()
            updates.acknowledged_by = user.id
        } else if (action === 'resolve') {
            updates.status = 'resolved'
            updates.resolved_at = new Date().toISOString()
            updates.resolved_by = user.id
        } else if (action === 'ignore') {
            updates.status = 'ignored'
        }

        const { data: alert, error } = await supabaseClient
            .from('alerts')
            .update(updates)
            .eq('id', alert_id)
            .select()
            .single()

        if (error) throw error

        // Log audit trail
        await supabaseClient.from('audit_logs').insert({
            organization_id: alert.organization_id,
            user_id: user.id,
            action: `alert_${action}`,
            resource_type: 'alert',
            resource_id: alert_id,
            metadata: { action, alert_id },
        })

        return new Response(JSON.stringify({ success: true, alert }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
