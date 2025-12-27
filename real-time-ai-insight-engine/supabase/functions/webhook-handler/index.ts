import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
    event: string
    data: Record<string, any>
    timestamp: string
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const payload: WebhookPayload = await req.json()
        const { event, data, timestamp } = payload

        // Verify webhook signature (if configured)
        const signature = req.headers.get('x-webhook-signature')
        const webhookSecret = Deno.env.get('WEBHOOK_SECRET')

        if (webhookSecret && signature) {
            const isValid = await verifySignature(JSON.stringify(payload), signature, webhookSecret)
            if (!isValid) {
                return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        // Process webhook based on event type
        let result
        switch (event) {
            case 'event.created':
                result = await handleEventCreated(supabaseClient, data)
                break
            case 'alert.triggered':
                result = await handleAlertTriggered(supabaseClient, data)
                break
            case 'insight.generated':
                result = await handleInsightGenerated(supabaseClient, data)
                break
            default:
                result = { message: 'Event type not handled', event }
        }

        // Log webhook delivery
        await supabaseClient.from('webhook_deliveries').insert({
            webhook_id: data.webhook_id || null,
            event_type: event,
            payload: data,
            response_status: 200,
            response_body: JSON.stringify(result),
            delivered_at: new Date().toISOString(),
        })

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})

async function verifySignature(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    )

    const signatureBuffer = hexToBuffer(signature)
    const dataBuffer = encoder.encode(payload)

    return await crypto.subtle.verify('HMAC', key, signatureBuffer, dataBuffer)
}

function hexToBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes.buffer
}

async function handleEventCreated(supabase: any, data: any) {
    console.log('Handling event.created:', data)

    // Trigger analysis if needed
    if (data.should_analyze) {
        const { error } = await supabase.functions.invoke('analyze-events', {
            body: {
                organization_id: data.organization_id,
                period_start: new Date(Date.now() - 3600000).toISOString(),
                period_end: new Date().toISOString(),
            },
        })

        if (error) throw error
    }

    return { processed: true, event_id: data.event_id }
}

async function handleAlertTriggered(supabase: any, data: any) {
    console.log('Handling alert.triggered:', data)

    // Send notifications (email, Slack, etc.)
    // This would integrate with external services

    return { notified: true, alert_id: data.alert_id }
}

async function handleInsightGenerated(supabase: any, data: any) {
    console.log('Handling insight.generated:', data)

    // Post-process insight
    // Could trigger additional workflows

    return { processed: true, insight_id: data.insight_id }
}
