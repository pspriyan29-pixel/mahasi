import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('Missing Supabase credentials in environment variables');
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Helper function to get organization stats
export async function getOrganizationStats(organizationId: string) {
    try {
        const { data, error } = await supabase
            .rpc('get_organization_stats', { org_id: organizationId });

        if (error) throw error;
        return data;
    } catch (error) {
        logger.error('Error fetching organization stats:', error);
        return null;
    }
}

// Helper function to create event
export async function createEvent(eventData: {
    organization_id: string;
    event_id: string;
    event_type: string;
    region?: string;
    amount?: number;
    user_id?: string;
    device?: string;
    metadata?: Record<string, any>;
}) {
    try {
        const { data, error } = await supabase
            .from('events')
            .insert({
                ...eventData,
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        logger.info(`Event created: ${eventData.event_id}`);
        return data;
    } catch (error) {
        logger.error('Error creating event:', error);
        throw error;
    }
}

// Helper function to create AI insight
export async function createInsight(insightData: {
    organization_id: string;
    status: 'NORMAL' | 'ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    possible_causes: string[];
    recommended_action?: string;
    analyzed_period_start: string;
    analyzed_period_end: string;
    metrics?: Record<string, any>;
}) {
    try {
        const { data, error } = await supabase
            .from('ai_insights')
            .insert(insightData)
            .select()
            .single();

        if (error) throw error;
        logger.info(`AI Insight created: ${data.id}`);
        return data;
    } catch (error) {
        logger.error('Error creating insight:', error);
        throw error;
    }
}

// Helper function to create alert
export async function createAlert(alertData: {
    organization_id: string;
    insight_id?: string;
    title: string;
    description?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}) {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .insert({
                ...alertData,
                status: 'open'
            })
            .select()
            .single();

        if (error) throw error;
        logger.info(`Alert created: ${data.id}`);
        return data;
    } catch (error) {
        logger.error('Error creating alert:', error);
        throw error;
    }
}

// Test Supabase connection
export async function testConnection(): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (error) {
            logger.error('Supabase connection test failed:', error);
            return false;
        }

        logger.info('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        logger.error('Supabase connection error:', error);
        return false;
    }
}
