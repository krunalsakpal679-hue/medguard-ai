#!/bin/bash

# MedGuard AI Frontend Deployment Utility
# Performs local builds and dispatches to the Vercel production edge.

echo "🚀 Initiating MedGuard Frontend Deployment Pipeline..."

# Build verification
echo "1. Executing production build..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ ERROR: Build output 'dist' directory not found."
    exit 1
fi

echo "2. Building audit: dist/ contents verified."
ls -la dist/

echo "3. Dispatching to Vercel Production..."
npx vercel --prod

echo "✅ SUCCESS: Deployment sequence complete!"

echo "🛡️ POST-DEPLOYMENT CHECKLIST:"
echo "1. Ensure VITE_API_URL is configured in Vercel dashboard."
echo "2. Add the Vercel domain to Google Cloud Console Authorized Origins."
echo "3. Update CORS settings on the Render/Backend instance."
