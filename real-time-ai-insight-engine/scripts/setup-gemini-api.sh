#!/bin/bash

# Gemini API Key Setup Script
# This script helps you set up the Gemini API key in all required locations

GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

echo "🚀 Setting up Gemini API Key..."
echo ""

# Setup Frontend .env.local
echo "📝 Setting up Frontend environment..."
cd frontend

if [ ! -f .env.local ]; then
    echo "Creating frontend/.env.local..."
    cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gfpmjtsgudbixfemeazz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=${GEMINI_API_KEY}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
    echo "✅ Created frontend/.env.local"
else
    # Check if GEMINI_API_KEY exists in the file
    if grep -q "GEMINI_API_KEY" .env.local; then
        # Update existing key
        sed -i "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=${GEMINI_API_KEY}/" .env.local
        echo "✅ Updated GEMINI_API_KEY in frontend/.env.local"
    else
        # Add new key
        echo "" >> .env.local
        echo "# Google Gemini AI" >> .env.local
        echo "GEMINI_API_KEY=${GEMINI_API_KEY}" >> .env.local
        echo "✅ Added GEMINI_API_KEY to frontend/.env.local"
    fi
fi

cd ..

# Setup Backend .env
echo "📝 Setting up Backend environment..."
cd backend

if [ ! -f .env ]; then
    echo "Creating backend/.env..."
    cat > .env << EOF
# Google Gemini AI
GEMINI_API_KEY=${GEMINI_API_KEY}

# Add your other environment variables here
# DATABASE_URL=
# KAFKA_BOOTSTRAP_SERVERS=
# KAFKA_API_KEY=
# KAFKA_API_SECRET=
EOF
    echo "✅ Created backend/.env"
else
    # Check if GEMINI_API_KEY exists in the file
    if grep -q "GEMINI_API_KEY" .env; then
        # Update existing key
        sed -i "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=${GEMINI_API_KEY}/" .env
        echo "✅ Updated GEMINI_API_KEY in backend/.env"
    else
        # Add new key
        echo "" >> .env
        echo "# Google Gemini AI" >> .env
        echo "GEMINI_API_KEY=${GEMINI_API_KEY}" >> .env
        echo "✅ Added GEMINI_API_KEY to backend/.env"
    fi
fi

cd ..

echo ""
echo "✅ Gemini API Key setup complete!"
echo ""
echo "📋 Summary:"
echo "  - Supabase Edge Functions: ✅ Configured in config.toml"
echo "  - Frontend: ✅ Configured in frontend/.env.local"
echo "  - Backend: ✅ Configured in backend/.env"
echo ""
echo "🔄 Next steps:"
echo "  1. Restart your services (Supabase, Frontend, Backend)"
echo "  2. Test the analyze-events function"
echo ""
echo "🎉 You're all set!"
