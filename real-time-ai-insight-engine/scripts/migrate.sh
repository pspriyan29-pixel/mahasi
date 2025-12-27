#!/bin/bash

# Database Migration Script
# Usage: ./scripts/migrate.sh [up|down|create] [migration_name]

set -e

MIGRATION_DIR="supabase/migrations"
TIMESTAMP=$(date +%Y%m%d%H%M%S)

case "$1" in
  create)
    if [ -z "$2" ]; then
      echo "Error: Migration name required"
      echo "Usage: ./scripts/migrate.sh create migration_name"
      exit 1
    fi
    MIGRATION_FILE="${MIGRATION_DIR}/${TIMESTAMP}_${2}.sql"
    touch "$MIGRATION_FILE"
    echo "-- Migration: $2" > "$MIGRATION_FILE"
    echo "-- Created: $(date)" >> "$MIGRATION_FILE"
    echo "" >> "$MIGRATION_FILE"
    echo "Created migration: $MIGRATION_FILE"
    ;;
  up)
    echo "Running migrations..."
    supabase db push
    ;;
  down)
    echo "Rolling back last migration..."
    # This would require custom implementation
    echo "Manual rollback required"
    ;;
  *)
    echo "Usage: ./scripts/migrate.sh [create|up|down] [migration_name]"
    exit 1
    ;;
esac

