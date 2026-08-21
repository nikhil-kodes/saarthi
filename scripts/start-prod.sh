#!/usr/bin/env bash
# ==============================================================================
# Saarthi Production Multi-Container Orchestration Launcher
# ==============================================================================
set -euo pipefail

echo "Starting Saarthi in Production Docker Compose mode..."

if [ ! -f .env ]; then
  echo "⚠️ .env file not found. Copying from .env.example..."
  cp .env.example .env
fi

echo "Building and launching containers..."
docker compose up -d --build

echo "Waiting for services to become healthy..."
sleep 5

docker compose ps

echo "======================================================="
echo "Saarthi is running!"
echo "Web Portal:       http://localhost:3000"
echo "AI Service:       http://localhost:8000"
echo "Queue State:      redis://localhost:6379"
echo "======================================================="
