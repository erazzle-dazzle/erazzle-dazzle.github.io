#!/bin/bash

source venv/bin/activate

cd backend
echo "Starting Backend..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 >> server.log &
cloudflared tunnel run schnapsn-backend >> tunnel.log &
echo "Backend up and running..."
