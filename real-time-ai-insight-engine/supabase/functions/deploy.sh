#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys all Edge Functions to Supabase

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

# Deploy each function
functions=("ingest-event" "analyze-events" "manage-alert" "webhook-handler" "scheduled-analysis")

for func in "${functions[@]}"; do
    echo "📦 Deploying $func..."
    supabase functions deploy $func --no-verify-jwt
    if [ $? -eq 0 ]; then
        echo "✅ $func deployed successfully"
    else
        echo "❌ Failed to deploy $func"
        exit 1
    fi
done

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment secrets:"
echo "   supabase secrets set GEMINI_API_KEY=your_key_here"
echo ""
echo "2. Test functions:"
echo "   curl https://gfpmjtsgudbixfemeazz.supabase.co/functions/v1/ingest-event"
