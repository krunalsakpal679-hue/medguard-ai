#!/bin/bash

MONGO_URI=${MONGO_URI:-""}
S3_BUCKET=${S3_BUCKET:-""}
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore_db.sh <backup_filename>"
  exit 1
fi

if [ -z "$MONGO_URI" ] || [ -z "$S3_BUCKET" ]; then
    echo "❌ Error: MONGO_URI or S3_BUCKET is not set."
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then 
    echo "Aborted."
    exit 1
fi

echo "Downloading backup from S3..."
aws s3 cp "s3://$S3_BUCKET/database-backups/$BACKUP_FILE" "./$BACKUP_FILE"

echo "Extracting backup..."
tar -xzf "./$BACKUP_FILE"

# Extract the base folder name from the tarball
EXTRACTED_DIR="./$(basename "$BACKUP_FILE" .tar.gz)"

echo "Restoring database..."
mongorestore --uri="$MONGO_URI" --drop "$EXTRACTED_DIR"

echo "Cleaning up local files..."
rm -rf "$EXTRACTED_DIR"
rm "./$BACKUP_FILE"

echo "✅ Database restored successfully from $BACKUP_FILE"
