#!/bin/bash

# Health Check Script
# Checks if all services are running properly

set -e

FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

echo "🏥 Running health checks..."

# Check frontend
echo -n "Frontend: "
if curl -f -s "$FRONTEND_URL" > /dev/null; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  exit 1
fi

# Check backend
echo -n "Backend: "
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  exit 1
fi

echo "✅ All services are healthy!"

