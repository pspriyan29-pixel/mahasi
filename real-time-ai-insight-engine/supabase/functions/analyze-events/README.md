# Analyze Events - Supabase Edge Function

## Overview
Advanced AI-powered anomaly detection system for real-time transaction monitoring. This function performs comprehensive statistical analysis on event data and generates actionable insights using Google's Gemini AI.

## Features

### 🔍 Advanced Statistical Analysis
- **Multiple Detection Methods**: Z-score, IQR (Interquartile Range), and percentile-based anomaly detection
- **Comprehensive Metrics**: Mean, median, standard deviation, and full percentile distribution (P25, P50, P75, P90, P95, P99)
- **Time Series Analysis**: Hourly aggregation with anomaly tracking
- **Regional Distribution**: Geographic pattern analysis
- **Event Type Analysis**: Transaction type distribution tracking

### 🤖 AI-Powered Insights
- **Gemini 1.5 Flash Integration**: Natural language explanations of anomalies
- **Contextual Analysis**: Data-driven insights with specific numbers and percentages
- **Actionable Recommendations**: Specific steps to address detected issues
- **Fallback Mechanism**: Statistical explanations when AI is unavailable

### ⚙️ Configurable Sensitivity
Three sensitivity levels for anomaly detection:
- **Low**: Conservative (Z-score > 4, 15% anomaly ratio)
- **Medium**: Balanced (Z-score > 3, 10% anomaly ratio) - Default
- **High**: Aggressive (Z-score > 2, 5% anomaly ratio)

### 🛡️ Robust Error Handling
- Input validation (required fields, date formats, date ranges)
- Comprehensive error messages
- Graceful degradation with fallback responses
- Detailed logging for debugging

## API Endpoint

### Request
```http
POST /analyze-events
Content-Type: application/json
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

### Request Body
```json
{
  "organization_id": "uuid",
  "period_start": "2024-01-01T00:00:00Z",
  "period_end": "2024-01-01T23:59:59Z",
  "metric_type": "transaction_volume",
  "threshold_sensitivity": "medium"
}
```

#### Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `organization_id` | string (UUID) | ✅ Yes | - | Organization to analyze |
| `period_start` | string (ISO 8601) | ✅ Yes | - | Analysis start time |
| `period_end` | string (ISO 8601) | ✅ Yes | - | Analysis end time |
| `metric_type` | string | ❌ No | `transaction_volume` | Metric to analyze |
| `threshold_sensitivity` | string | ❌ No | `medium` | Detection sensitivity |

#### Metric Types
- `transaction_volume`: Count of transactions
- `transaction_amount`: Transaction values
- `user_activity`: User engagement patterns
- `regional_distribution`: Geographic patterns

#### Sensitivity Levels
- `low`: Fewer false positives, may miss subtle anomalies
- `medium`: Balanced detection (recommended)
- `high`: More sensitive, may have false positives

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "insight": {
    "id": "uuid",
    "organization_id": "uuid",
    "status": "ANOMALY",
    "severity": "HIGH",
    "summary": "High severity anomaly: 45 unusual events (15.2%) detected",
    "possible_causes": [
      "Statistical deviation detected (max z-score: 5.23)",
      "Unusual concentration in regions: US-WEST, EU-CENTRAL",
      "transaction_volume values significantly differ from baseline"
    ],
    "recommended_action": "Immediate investigation required - review recent transactions",
    "detailed_insights": [
      "Analyzed 296 events with 45 anomalies",
      "95th percentile: 1250.50",
      "Regional distribution: 8 regions",
      "Event types: 5 different types"
    ],
    "affected_regions": ["US-WEST", "EU-CENTRAL"],
    "affected_event_types": ["payment", "refund"],
    "analyzed_period_start": "2024-01-01T00:00:00Z",
    "analyzed_period_end": "2024-01-01T23:59:59Z",
    "created_at": "2024-01-02T10:30:00Z"
  },
  "analysis": {
    "isAnomaly": true,
    "severity": "HIGH",
    "confidence": 0.87,
    "threshold_sensitivity": "medium",
    "events_analyzed": 296,
    "metrics": {
      "mean": 850.25,
      "median": 720.00,
      "stdDev": 245.30,
      "maxZScore": 5.23,
      "anomalyCount": 45,
      "totalEvents": 296,
      "metricType": "transaction_volume",
      "percentileData": {
        "p25": 550.00,
        "p50": 720.00,
        "p75": 980.00,
        "p90": 1150.00,
        "p95": 1250.50,
        "p99": 1450.00
      },
      "regionalDistribution": {
        "US-WEST": 89,
        "EU-CENTRAL": 67,
        "ASIA-EAST": 45,
        "US-EAST": 42,
        "EU-WEST": 35,
        "ASIA-SOUTH": 18
      },
      "typeDistribution": {
        "payment": 180,
        "refund": 65,
        "transfer": 30,
        "withdrawal": 15,
        "deposit": 6
      },
      "timeSeriesData": [
        {
          "timestamp": "2024-01-01T00:00:00",
          "value": 750.25,
          "isAnomaly": false
        },
        {
          "timestamp": "2024-01-01T01:00:00",
          "value": 1450.00,
          "isAnomaly": true
        }
      ]
    }
  }
}
```

#### Error Response (400/500)
```json
{
  "error": "Missing required fields: organization_id, period_start, period_end",
  "timestamp": "2024-01-02T10:30:00Z"
}
```

## Environment Variables

Required environment variables in Supabase:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key  # Optional, falls back to statistical analysis
```

## Database Schema

### Required Tables

#### `events`
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL,
  region TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  user_id TEXT NOT NULL,
  device TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_org_timestamp ON events(organization_id, timestamp);
CREATE INDEX idx_events_region ON events(region);
CREATE INDEX idx_events_type ON events(event_type);
```

#### `ai_insights`
```sql
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status TEXT NOT NULL CHECK (status IN ('NORMAL', 'ANOMALY')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  summary TEXT NOT NULL,
  possible_causes TEXT[] NOT NULL,
  recommended_action TEXT,
  analyzed_period_start TIMESTAMPTZ NOT NULL,
  analyzed_period_end TIMESTAMPTZ NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_org_created ON ai_insights(organization_id, created_at DESC);
```

#### `alerts`
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  insight_id UUID REFERENCES ai_insights(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'resolved')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_org_status ON alerts(organization_id, status);
```

## Usage Examples

### Basic Analysis
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/analyze-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  },
  body: JSON.stringify({
    organization_id: '123e4567-e89b-12d3-a456-426614174000',
    period_start: '2024-01-01T00:00:00Z',
    period_end: '2024-01-01T23:59:59Z'
  })
})

const data = await response.json()
console.log(data.insight.summary)
```

### High Sensitivity Analysis
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/analyze-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  },
  body: JSON.stringify({
    organization_id: '123e4567-e89b-12d3-a456-426614174000',
    period_start: '2024-01-01T00:00:00Z',
    period_end: '2024-01-01T23:59:59Z',
    metric_type: 'transaction_amount',
    threshold_sensitivity: 'high'
  })
})
```

### Scheduled Analysis (Cron Job)
```typescript
// Run every hour
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async () => {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  const response = await fetch('https://your-project.supabase.co/functions/v1/analyze-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      period_start: oneHourAgo.toISOString(),
      period_end: now.toISOString(),
      metric_type: 'transaction_volume',
      threshold_sensitivity: 'medium'
    })
  })
  
  return new Response('Analysis completed', { status: 200 })
})
```

## Anomaly Detection Algorithm

### 1. Z-Score Method
Identifies outliers based on standard deviations from the mean:
```
z-score = |value - mean| / standard_deviation
```
- Values with z-score > threshold are flagged as anomalies

### 2. IQR Method
Uses interquartile range for robust outlier detection:
```
IQR = P75 - P25
Lower Bound = P25 - 1.5 × IQR
Upper Bound = P75 + 1.5 × IQR
```
- Values outside bounds are potential outliers

### 3. Confidence Scoring
Combines multiple signals to calculate confidence (0-1):
```
confidence = (maxZScore / 10) × 0.5 + (anomalyRatio / 0.2) × 0.5
```

### 4. Severity Classification
- **HIGH**: Z-score > 5 OR anomaly ratio > 20%
- **MEDIUM**: Z-score > 4 OR anomaly ratio > 15%
- **LOW**: Other anomalies

## Performance Considerations

- **Optimal Period**: 1 hour to 24 hours for best results
- **Event Volume**: Handles 1-100K events efficiently
- **Response Time**: ~2-5 seconds (including AI analysis)
- **Rate Limiting**: Consider implementing for production use

## Troubleshooting

### No Anomalies Detected
- Try adjusting `threshold_sensitivity` to `high`
- Ensure sufficient event volume (minimum 30 events recommended)
- Check if events have variation in values

### AI Explanation Unavailable
- Verify `GEMINI_API_KEY` is set correctly
- Check Gemini API quota and billing
- Function falls back to statistical explanations automatically

### High False Positive Rate
- Use `low` sensitivity for more stable environments
- Increase the analysis period for better baseline
- Review metric_type selection

## Best Practices

1. **Regular Analysis**: Run hourly or daily for continuous monitoring
2. **Baseline Period**: Use at least 7 days of historical data
3. **Alert Thresholds**: Start with `medium` sensitivity and adjust
4. **Regional Analysis**: Monitor regional distribution for geographic anomalies
5. **Event Type Tracking**: Track event type patterns for behavioral insights

## Security

- Uses Supabase Service Role Key (keep secure)
- CORS enabled for authorized origins only
- Input validation on all parameters
- No sensitive data in logs

## License

Part of the Real-Time AI Insight Engine project.
