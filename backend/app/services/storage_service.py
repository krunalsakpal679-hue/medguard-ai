import os
import uuid
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException, status
from typing import Optional, Dict
from app.core.config import settings
from app.core.logger import logger
import shutil

class StorageService:
    """
    Handles clinical file uploads to S3 with local fallback and strict validation.
    """
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=settings.S3_ENDPOINT_URL if hasattr(settings, 'S3_ENDPOINT_URL') else None,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET
        self.local_upload_dir = "uploads"
        
        # Ensure local fallback directory exists
        if not os.path.exists(self.local_upload_dir):
            os.makedirs(self.local_upload_dir)

    async def upload_file(self, file: UploadFile, user_id: str) -> Dict:
        """Upload a prescription image/PDF to storage and return its metadata."""
        self._validate_file(file)
        
        file_key = self._generate_key(user_id, file.filename)
        content_type = file.content_type
        
        try:
            # Attempt S3 Upload
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                file_key,
                ExtraArgs={'ContentType': content_type}
            )
            
            file_url = f"{settings.S3_CUSTOM_DOMAIN}/{file_key}" if hasattr(settings, 'S3_CUSTOM_DOMAIN') else f"https://{self.bucket_name}.s3.amazonaws.com/{file_key}"
            
            return {
                "url": file_url,
                "key": file_key,
                "size": file.size if hasattr(file, 'size') else 0, # Note: file.size is available in some FastAPI versions
                "content_type": content_type,
                "provider": "s3"
            }
            
        except (ClientError, Exception) as e:
            logger.warning(f"S3 Upload failed, falling back to local storage: {str(e)}")
            
            # Local Fallback
            local_path = os.path.join(self.local_upload_dir, file_key)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            # Reset file pointer to beginning for retry
            await file.seek(0)
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            return {
                "url": f"/api/v1/uploads/{file_key}",
                "key": file_key,
                "size": os.path.getsize(local_path),
                "content_type": content_type,
                "provider": "local"
            }

    async def get_signed_url(self, key: str, expires: int = 3600) -> str:
        """Generate a temporary signed URL for private S3 assets."""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires
            )
            return url
        except Exception:
            # If S3 signature fails, assume local path
            return f"/api/v1/uploads/{key}"

    async def delete_file(self, key: str) -> bool:
        """Remove file from primary storage or local fallback."""
        try:
            # Try S3 delete
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception:
            local_path = os.path.join(self.local_upload_dir, key)
            if os.path.exists(local_path):
                os.remove(local_path)
                return True
            return False

    def _validate_file(self, file: UploadFile) -> None:
        """Strict clinical validation: type and size checks."""
        ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        MAX_SIZE = 10 * 1024 * 1024  # 10MB

        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file.content_type}. Use JPG, PNG, WEBP, or PDF."
            )
        
        # Check size if available (FastAPI 0.95+)
        if hasattr(file, 'size') and file.size > MAX_SIZE:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 10MB clinical safety limit."
            )

    def _generate_key(self, user_id: str, filename: str) -> str:
        """Generate a hierarchical clinical storage key."""
        ext = os.path.splitext(filename)[1]
        unique_id = uuid.uuid4()
        return f"prescriptions/{user_id}/{unique_id}{ext}"

# Singleton instance
storage_service = StorageService()
