#!/bin/bash

# Load environment variables from the .env file
source .env

# Get the container ID of the PostgreSQL container
CONTAINER_ID=$(docker compose ps -q postgres)

# Create a timestamp for the backup filename
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Use the environment variables for MinIO configuration
MINIO_ENDPOINT="${S3_ENDPOINT:-localhost:9000}"
MINIO_ACCESS_KEY="${S3_ACCESS_KEY:-backup}"
MINIO_SECRET_KEY="${S3_SECRET_KEY:-12345678}"
POSTGRES_USER="${POSTGRES_USER:-root}"

# Set the bucket and object key for the upload
BUCKET_NAME="${S3_BACKUP_BUCKET:-backup}"
FILE_PATH="backup_$TIMESTAMP.sql"
OBJECT_KEY=$FILE_PATH

# Run the pg_dump command to create a backup file
echo "Creating PostgreSQL backup..."
docker exec $CONTAINER_ID pg_dump -U $POSTGRES_USER -Fc postgres > $FILE_PATH 2>&1

# Upload the backup file to MinIO without signature (simple upload)
echo "Uploading backup to MinIO..."
UPLOAD_RESPONSE=$(curl -w "%{http_code}" -o /dev/null -X PUT -T "${FILE_PATH}" \
     -H "Authorization: Bearer ${S3_ACCESS_KEY}:${S3_SECRET_KEY}" \
     "${MINIO_ENDPOINT}/${BUCKET_NAME}/${OBJECT_KEY}")

# Check if the upload was successful (HTTP 200 status code)
if [ "$UPLOAD_RESPONSE" -eq 200 ]; then
    echo "Backup uploaded successfully to MinIO."
else
    echo "Failed to upload backup to MinIO. HTTP Status Code: $UPLOAD_RESPONSE"
    exit 1
fi

# Clean up the backup file after upload
rm -f $FILE_PATH
