#!/bin/bash

# MedGuard AI iOS Build Orchestrator
# Dispatches a request to the EAS cloud for a preview IPA build.

echo "🚀 Initiating MedGuard iOS Preview Build (IPA)..."

if ! command -v eas &> /dev/null
then
    echo "❌ ERROR: EAS CLI not found. Please run 'npm install -g eas-cli'."
    exit 1
fi

eas build --platform ios --profile preview

echo "✅ Build dispatch complete."
echo "📊 Track progress on the EAS Dashboard: https://expo.dev/artifacts"
