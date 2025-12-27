export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    plan: 'free' | 'pro' | 'enterprise'
                    settings: Record<string, any>
                    metadata: Record<string, any>
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['organizations']['Insert']>
            }
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    metadata: Record<string, any>
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['users']['Insert']>
            }
            organization_members: {
                Row: {
                    id: string
                    organization_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'member' | 'viewer'
                    permissions: Record<string, any>
                    invited_by: string | null
                    joined_at: string
                }
                Insert: Omit<Database['public']['Tables']['organization_members']['Row'], 'id' | 'joined_at'>
                Update: Partial<Database['public']['Tables']['organization_members']['Insert']>
            }
            data_sources: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    type: 'kafka' | 'webhook' | 'api' | 'file'
                    config: Record<string, any>
                    status: 'active' | 'paused' | 'error'
                    last_event_at: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['data_sources']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['data_sources']['Insert']>
            }
            events: {
                Row: {
                    id: string
                    organization_id: string
                    data_source_id: string | null
                    event_id: string
                    timestamp: string
                    event_type: string
                    region: string | null
                    amount: number | null
                    user_id: string | null
                    device: string | null
                    ip_address: string | null
                    metadata: Record<string, any>
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['events']['Insert']>
            }
            ai_insights: {
                Row: {
                    id: string
                    organization_id: string
                    status: 'NORMAL' | 'ANOMALY'
                    severity: 'LOW' | 'MEDIUM' | 'HIGH'
                    summary: string
                    possible_causes: string[]
                    recommended_action: string | null
                    analyzed_period_start: string
                    analyzed_period_end: string
                    metrics: Record<string, any>
                    metadata: Record<string, any>
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['ai_insights']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['ai_insights']['Insert']>
            }
            alerts: {
                Row: {
                    id: string
                    organization_id: string
                    insight_id: string | null
                    title: string
                    description: string | null
                    status: 'open' | 'acknowledged' | 'resolved' | 'ignored'
                    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
                    assigned_to: string | null
                    acknowledged_at: string | null
                    acknowledged_by: string | null
                    resolved_at: string | null
                    resolved_by: string | null
                    resolution_notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['alerts']['Insert']>
            }
            alert_rules: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    description: string | null
                    conditions: Record<string, any>
                    actions: Record<string, any>
                    enabled: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['alert_rules']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['alert_rules']['Insert']>
            }
            dashboards: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    description: string | null
                    layout: Record<string, any>
                    is_public: boolean
                    is_default: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['dashboards']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['dashboards']['Insert']>
            }
            api_keys: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    key_hash: string
                    prefix: string
                    permissions: Record<string, any>
                    last_used_at: string | null
                    expires_at: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['api_keys']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['api_keys']['Insert']>
            }
            webhooks: {
                Row: {
                    id: string
                    organization_id: string
                    url: string
                    events: string[]
                    secret: string
                    enabled: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['webhooks']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['webhooks']['Insert']>
            }
            webhook_deliveries: {
                Row: {
                    id: string
                    webhook_id: string
                    event_type: string
                    payload: Record<string, any>
                    response_status: number | null
                    response_body: string | null
                    delivered_at: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['webhook_deliveries']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['webhook_deliveries']['Insert']>
            }
            audit_logs: {
                Row: {
                    id: string
                    organization_id: string
                    user_id: string | null
                    action: string
                    resource_type: string
                    resource_id: string | null
                    metadata: Record<string, any>
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
    }
}
