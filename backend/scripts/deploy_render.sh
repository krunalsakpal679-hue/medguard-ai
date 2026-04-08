#!/bin/bash

# MedGuard AI Deployment Orchestrator
# Automates the triggering of Render build pipelines via API

echo "🚀 Initiating MedGuard AI Deployment Pipeline..."

if [ -z "$RENDER_API_KEY" ] || [ -z "$RENDER_SERVICE_ID" ]; then
    echo "❌ ERROR: RENDER_API_KEY and RENDER_SERVICE_ID must be set."
    exit 1
fi

echo "1. Synchronizing environment variables with Render Control Plane..."
echo "2. Dispatching deployment trigger..."

RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": false}')

if [[ $RESPONSE == *"id"* ]]; then
    echo "✅ SUCCESS: Deployment triggered successfully."
    echo "📊 Monitor progress here: https://dashboard.render.com"
else
    echo "❌ FAILURE: Failed to trigger deployment."
    echo "Response: $RESPONSE"
    exit 1
fi
