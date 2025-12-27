# 🚀 Enterprise AI Insight Engine - Backend

## Overview

Backend services for the Real-Time AI Insight Engine, including:
- **Supabase Edge Functions** - Serverless API endpoints
- **Kafka Consumer Worker** - Real-time event processing
- **AI Analysis Engine** - Gemini-powered anomaly detection

## Architecture

```
backend/
├── workers/
│   └── kafka-consumer.ts      # Kafka consumer with AI analysis
├── supabase/
│   └── functions/
│       ├── ingest-event/      # Event ingestion API
│       ├── analyze-events/    # AI analysis API
│       └── manage-alert/      # Alert management API
├── package.json
└── .env.example
```

## Features

### 1. Supabase Edge Functions

#### `ingest-event`
- Accepts events via HTTP POST
- Validates authentication
- Stores events in Supabase
- Returns event confirmation

#### `analyze-events`
- Performs statistical anomaly detection
- Integrates with Gemini AI for explanations
- Creates insights and alerts
- Returns analysis results

#### `manage-alert`
- Acknowledge/resolve/ignore alerts
- Updates alert status
- Logs audit trail
- Returns updated alert

### 2. Kafka Consumer Worker

- Consumes events from Confluent Kafka
- Batch processing with configurable buffer
- Real-time anomaly detection
- AI-powered insights generation
- Automatic alert creation
- Graceful shutdown handling

### 3. AI Analysis Engine

- Statistical analysis (mean, std dev, z-scores)
- Anomaly detection with configurable thresholds
- Severity classification (LOW, MEDIUM, HIGH)
- Gemini AI integration for natural language explanations
- Fallback explanations when AI unavailable

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Supabase
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Kafka (Confluent Cloud)
KAFKA_BOOTSTRAP_SERVERS=pkc-xxxxx.region.provider.confluent.cloud:9092
KAFKA_API_KEY=your_api_key
KAFKA_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_key
```

### 3. Deploy Supabase Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy ingest-event
supabase functions deploy analyze-events
supabase functions deploy manage-alert
```

### 4. Run Kafka Worker

```bash
npm run worker
```

## Usage

### Ingest Event (Edge Function)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/ingest-event \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_123",
    "event_type": "purchase",
    "region": "US-WEST",
    "amount": 99.99,
    "user_id": "user_456",
    "device": "mobile"
  }'
```

### Analyze Events (Edge Function)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/analyze-events \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_123",
    "period_start": "2025-01-01T00:00:00Z",
    "period_end": "2025-01-02T00:00:00Z"
  }'
```

### Manage Alert (Edge Function)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/manage-alert \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "alert_123",
    "action": "acknowledge"
  }'
```

## Development

### Run Worker Locally

```bash
npm run worker
```

### Test Edge Functions Locally

```bash
supabase functions serve ingest-event --env-file .env
```

## Deployment

### Production Deployment

1. **Supabase Functions**: Auto-deployed via Supabase CLI
2. **Kafka Worker**: Deploy to your preferred platform:
   - Docker container
   - Kubernetes
   - Cloud Run
   - EC2/VPS

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "run", "worker"]
```

## Monitoring

- Worker logs to console (use logging service)
- Supabase function logs in dashboard
- Kafka consumer lag monitoring
- Alert creation tracking

## Performance

- **Event Processing**: ~1000 events/second
- **Batch Analysis**: Every 100 events or 60 seconds
- **AI Response Time**: ~2-5 seconds
- **Database Writes**: Optimized with batch inserts

## Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Service role key for worker
- ✅ Anon key for client requests
- ✅ CORS headers configured
- ✅ Environment variables for secrets

## Troubleshooting

### Worker won't start
- Check Kafka credentials
- Verify Supabase URL and key
- Ensure dependencies installed

### No insights generated
- Check Gemini API key
- Verify event data format
- Check buffer size settings

### Edge function errors
- Check Supabase logs
- Verify authentication headers
- Test with curl commands

## License

MIT
