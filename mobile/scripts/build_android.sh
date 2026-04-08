#!/bin/bash

# MedGuard AI Android Build Orchestrator
# Dispatches a request to the EAS cloud for a preview APK build.

echo "🚀 Initiating MedGuard Android Preview Build (APK)..."

if ! command -v eas &> /dev/null
then
    echo "❌ ERROR: EAS CLI not found. Please run 'npm install -g eas-cli'."
    exit 1
fi

eas build --platform android --profile preview

echo "✅ Build dispatch complete."
echo "📊 Track progress on the EAS Dashboard: https://expo.dev/artifacts"
