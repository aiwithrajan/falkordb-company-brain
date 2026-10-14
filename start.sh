#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  OrgMind: A Living Graph of the Entire Company"
echo "  Track 3: Company Brain | Powered by FalkorDB"
echo "=========================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH=/Users/apple/.local/bin:$PATH

echo "1. Checking FalkorDB Docker container..."
if ! docker ps | grep -q "falkordb"; then
    echo "Starting FalkorDB via docker compose..."
    docker compose up -d
    sleep 3
else
    echo "FalkorDB is already running on ports 6379 and 3000."
fi

echo "2. Seeding initial Nexora Cloud Knowledge Graph..."
PYTHONPATH="$ROOT_DIR" "$ROOT_DIR/venv/bin/python3" "$ROOT_DIR/backend/seed_data.py"

echo "3. Starting FastAPI Backend Server on port 8000..."
PYTHONPATH="$ROOT_DIR" "$ROOT_DIR/venv/bin/uvicorn" backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "4. Starting Vite React Frontend Console on port 5173..."
cd "$ROOT_DIR/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  OrgMind is LIVE!"
echo "  - Web Console:      http://localhost:5173"
echo "  - Backend API:      http://localhost:8000/docs"
echo "  - FalkorDB Browser: http://localhost:3000"
echo "=========================================================="
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM
wait
