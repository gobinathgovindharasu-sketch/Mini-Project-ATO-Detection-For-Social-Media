#!/bin/bash
set -e

echo "=== ATO Detection Backend ==="

# Run Alembic migrations (skip on SQLite if tables exist)
echo "Running database migrations..."
alembic upgrade head 2>/dev/null || echo "Migration skipped (tables may already exist)"

# Seed demo data
echo "Seeding demo data..."
python seed_data.py

# Start uvicorn
echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
