#!/bin/bash

# MedGuard AI OTA Update Utility
# Publishes over-the-air clinical logic updates via EAS Update.

echo "🚀 Dispatching Over-The-Air (OTA) Update for Production..."

if ! command -v eas &> /dev/null
then
    echo "❌ ERROR: EAS CLI not found."
    exit 1
fi

eas update --branch production --message "Clinical logic synchronization and UI performance hardening."

echo "✅ OTA Update published to the production branch."
echo "📲 Users will synchronize on next application cold launch."
