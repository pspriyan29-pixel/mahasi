export interface TransactionEvent {
    id: string;
    timestamp: string;
    region: string;
    amount: number;
    user_id: string;
    type: 'purchase' | 'refund' | 'transfer';
    metadata: {
        device: 'mobile' | 'desktop' | 'tablet';
        ip: string;
    };
}

export interface AIInsight {
    status: 'NORMAL' | 'ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    possible_causes: string[];
    recommended_action: string;
    timestamp: string;
    analyzed_period: {
        start: string;
        end: string;
    };
}

export interface MetricsSummary {
    total_events: number;
    events_per_second: number;
    avg_transaction_amount: number;
    active_regions: number;
}
