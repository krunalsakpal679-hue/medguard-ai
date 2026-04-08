#!/bin/bash

# Configuration
MONGO_URI=${MONGO_URI:-""}
S3_BUCKET=${S3_BUCKET:-""}

if [ -z "$MONGO_URI" ]; then
    echo "❌ Error: MONGO_URI is not set."
    exit 1
fi

if [ -z "$S3_BUCKET" ]; then
    echo "❌ Error: S3_BUCKET is not set."
    exit 1
fi

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"
mkdir -p "$BACKUP_DIR"

echo "Backing up MedGuard database..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR"

echo "Compressing backup..."
BACKUP_FILE="medguard_backup_$DATE.tar.gz"
tar -czf "./backups/$BACKUP_FILE" -C "./backups" "$DATE"
rm -rf "$BACKUP_DIR"

echo "Uploading to S3..."
aws s3 cp "./backups/$BACKUP_FILE" \
  "s3://$S3_BUCKET/database-backups/$BACKUP_FILE"

echo "✅ Backup complete: $BACKUP_FILE"
echo "Backups older than 30 days are viewable via AWS CLI:"
aws s3 ls "s3://$S3_BUCKET/database-backups/" | sort -k1,2
