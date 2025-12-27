# Supabase Edge Functions

This directory contains Deno-based serverless functions that run on Supabase Edge Runtime.

## Available Functions

### 1. ingest-event
**Purpose**: Handles event ingestion from external sources

**Endpoint**: `POST /functions/v1/ingest-event`

**Request Body**:
```json
{
  "event_id": "evt_123",
  "event_type": "purchase",
  "region": "US-WEST",
  "amount": 99.99,
  "user_id": "user_456",
  "device": "mobile",
  "metadata": {}
}
```

**Authentication**: Requires valid Supabase auth token

---

### 2. analyze-events
**Purpose**: Performs statistical analysis and AI-powered anomaly detection

**Endpoint**: `POST /functions/v1/analyze-events`

**Request Body**:
```json
{
  "organization_id": "org_123",
  "period_start": "2025-01-01T00:00:00Z",
  "period_end": "2025-01-26T00:00:00Z"
}
```

**Features**:
- Statistical anomaly detection (z-score based)
- Google Gemini AI analysis
- Automatic alert creation
- Insight storage

---

### 3. manage-alert
**Purpose**: Update alert status and manage alert lifecycle

**Endpoint**: `POST /functions/v1/manage-alert`

**Request Body**:
```json
{
  "alert_id": "alert_123",
  "action": "acknowledge|resolve|dismiss",
  "notes": "Optional notes"
}
```

---

### 4. webhook-handler
**Purpose**: Handles incoming webhooks from external services

**Endpoint**: `POST /functions/v1/webhook-handler`

**Features**:
- Webhook signature verification
- Event routing
- Retry logic

---

### 5. scheduled-analysis
**Purpose**: Runs periodic analysis on a schedule

**Trigger**: Cron schedule (configurable)

**Features**:
- Automatic periodic analysis
- Organization-based processing
- Error handling and logging

---

## Development

### Local Testing

```bash
# Start Supabase locally
supabase start

# Serve a specific function
supabase functions serve ingest-event

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/ingest-event' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"event_id":"test_1","event_type":"purchase"}'
```

### Deploy

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy ingest-event

# Set secrets
supabase secrets set GEMINI_API_KEY=your_key_here
```

---

## Environment Variables

Required secrets for Edge Functions:

- `GEMINI_API_KEY` - Google Gemini API key for AI analysis
- `SUPABASE_URL` - Supabase project URL (auto-provided)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-provided)

---

## Error Handling

All functions include:
- Try-catch error handling
- Detailed error logging
- Proper HTTP status codes
- Error response formatting

---

## Security

- Row Level Security (RLS) enforced
- JWT token validation
- Organization-based access control
- Input validation and sanitization
