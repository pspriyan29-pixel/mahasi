#!/bin/bash

# Development Environment Setup Script

set -e

echo "🚀 Setting up AI Insight Engine development environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 or higher is required"
  exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Setup environment files
echo "⚙️  Setting up environment files..."
if [ ! -f "frontend/.env.local" ]; then
  cp frontend/.env.example frontend/.env.local 2>/dev/null || echo "# Add your env vars here" > frontend/.env.local
  echo "✅ Created frontend/.env.local"
fi

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env 2>/dev/null || echo "# Add your env vars here" > backend/.env
  echo "✅ Created backend/.env"
fi

# Setup Git hooks
echo "🔧 Setting up Git hooks..."
npm run prepare 2>/dev/null || echo "⚠️  Husky setup skipped (install husky first)"

echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update environment variables in frontend/.env.local and backend/.env"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Start backend: cd backend && npm run dev"

