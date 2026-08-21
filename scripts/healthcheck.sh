#!/usr/bin/env bash
# ==============================================================================
# Saarthi Production Multi-Service Healthcheck Probe
# ==============================================================================
set -euo pipefail

echo "======================================================="
echo "Saarthi Multi-Service Healthcheck Probe"
echo "======================================================="

# 1. Probe Redis
echo -n "Checking Redis broker (localhost:6379)... "
if command -v redis-cli &>/dev/null; then
  if redis-cli ping &>/dev/null; then
    echo "✅ OPERATIONAL"
  else
    echo "⚠️ REDIS NOT REACHABLE ON PORT 6379"
  fi
else
  echo "ℹ️ (redis-cli not installed locally, skipping CLI check)"
fi

# 2. Probe FastAPI AI microservice
echo -n "Checking FastAPI AI Service (http://localhost:8000/api/v1/health)... "
FASTAPI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health || echo "DOWN")
if [ "$FASTAPI_STATUS" = "200" ]; then
  echo "✅ OPERATIONAL (HTTP 200)"
else
  echo "ℹ️ Status: $FASTAPI_STATUS"
fi

# 3. Probe Next.js Web App
echo -n "Checking Next.js Web Application (http://localhost:3000)... "
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/session || echo "DOWN")
if [ "$WEB_STATUS" = "200" ] || [ "$WEB_STATUS" = "401" ]; then
  echo "✅ OPERATIONAL (HTTP $WEB_STATUS)"
else
  echo "ℹ️ Status: $WEB_STATUS"
fi

echo "======================================================="
echo "Healthcheck Probe Completed."
echo "======================================================="
