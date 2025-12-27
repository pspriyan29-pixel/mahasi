# Supabase Setup Guide

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase account and project created
- PostgreSQL client (optional, for local testing)

## Initial Setup

### 1. Link to Supabase Project

```bash
supabase link --project-ref gfpmjtsgudbixfemeazz
```

### 2. Run Database Migrations

```bash
# Apply all migrations
supabase db push

# Or run SQL directly
psql -h db.gfpmjtsgudbixfemeazz.supabase.co -U postgres -d postgres -f SETUP_DATABASE.sql
```

### 3. Set Environment Secrets

```bash
# Set Gemini API key for Edge Functions
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Verify secrets
supabase secrets list
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
cd functions
./deploy.sh

# Or deploy individually
supabase functions deploy ingest-event
supabase functions deploy analyze-events
supabase functions deploy manage-alert
supabase functions deploy webhook-handler
supabase functions deploy scheduled-analysis
```

---

## Local Development

### Start Supabase Locally

```bash
# Start all services
supabase start

# This will start:
# - PostgreSQL database
# - Auth server
# - Storage server
# - Realtime server
# - Edge Functions runtime
```

### Access Local Services

- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres

### Test Edge Functions Locally

```bash
# Serve a function
supabase functions serve ingest-event

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/ingest-event' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --header 'Content-Type: application/json' \
  --data '{
    "event_id": "test_1",
    "event_type": "purchase",
    "region": "US-WEST",
    "amount": 99.99
  }'
```

---

## Database Schema

The database schema is defined in:
- `SETUP_DATABASE.sql` - Main schema with tables and RLS policies
- `migrations/` - Incremental schema changes

### Key Tables

1. **users** - User profiles
2. **organizations** - Multi-tenant organizations
3. **organization_members** - User-organization relationships
4. **events** - Event data stream
5. **ai_insights** - AI analysis results
6. **alerts** - Generated alerts
7. **api_keys** - API authentication
8. **webhooks** - Webhook configurations

### Row Level Security (RLS)

All tables have RLS policies enforcing:
- Organization-based access control
- User role permissions
- Service role bypass for Edge Functions

---

## Edge Functions

### ingest-event
Handles event ingestion from external sources.

**Usage**:
```bash
curl -X POST https://gfpmjtsgudbixfemeazz.supabase.co/functions/v1/ingest-event \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_123",
    "event_type": "purchase",
    "amount": 99.99
  }'
```

### analyze-events
Performs AI-powered anomaly detection.

**Usage**:
```bash
curl -X POST https://gfpmjtsgudbixfemeazz.supabase.co/functions/v1/analyze-events \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_123",
    "period_start": "2025-01-01T00:00:00Z",
    "period_end": "2025-01-26T00:00:00Z"
  }'
```

### manage-alert
Updates alert status and lifecycle.

**Usage**:
```bash
curl -X POST https://gfpmjtsgudbixfemeazz.supabase.co/functions/v1/manage-alert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "alert_123",
    "action": "acknowledge"
  }'
```

---

## Monitoring & Debugging

### View Function Logs

```bash
# View logs for a specific function
supabase functions logs ingest-event

# Follow logs in real-time
supabase functions logs ingest-event --follow
```

### Database Logs

```bash
# View database logs
supabase db logs

# View specific table activity
supabase db logs --table events
```

---

## Troubleshooting

### Function Deployment Issues

```bash
# Check function status
supabase functions list

# Redeploy with verbose output
supabase functions deploy ingest-event --debug
```

### Database Connection Issues

```bash
# Test database connection
supabase db ping

# Reset local database
supabase db reset
```

### RLS Policy Issues

```bash
# Disable RLS temporarily for testing (local only!)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

# Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

---

## Production Checklist

- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Edge Functions deployed
- [ ] Environment secrets set
- [ ] API keys generated
- [ ] Webhooks configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] SSL certificates verified

---

## Useful Commands

```bash
# Generate TypeScript types from database
supabase gen types typescript --local > types/supabase.ts

# Create new migration
supabase migration new add_new_feature

# View database diff
supabase db diff

# Backup database
pg_dump -h db.gfpmjtsgudbixfemeazz.supabase.co -U postgres > backup.sql
```
