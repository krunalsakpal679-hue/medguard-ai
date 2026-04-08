import os
import aiofiles
from uuid import uuid4
from fastapi import UploadFile
from app.core.config import settings
from app.services.firebase_storage_service import FirebaseStorageService

class LocalStorageService:
    """
    Saves files to the local filesystem. For development/testing only.
    """
    def __init__(self):
        self.upload_dir = "uploads"
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)

    async def upload_file(self, file: UploadFile, user_id: str) -> dict:
        filename = f"{uuid4()}_{file.filename}"
        user_dir = os.path.join(self.upload_dir, user_id)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
            
        file_path = os.path.join(user_dir, filename)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        return {
            "url": f"/api/v1/uploads/{user_id}/{filename}",
            "path": file_path,
            "size": len(content),
            "content_type": file.content_type
        }

    async def delete_file(self, path: str) -> bool:
        if os.path.exists(path):
            os.remove(path)
            return True
        return False

    async def get_signed_url(self, path: str, **kwargs) -> str:
        # Local doesn't really have signed URLs, just return the path/url
        return path

class S3StorageService:
    """
    Placeholder for S3 Storage Service.
    We would implement this using boto3.
    """
    def __init__(self):
        import boto3
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.bucket = settings.S3_BUCKET

    async def upload_file(self, file: UploadFile, user_id: str) -> dict:
        # Simplistic implementation for the factory
        file_key = f"prescriptions/{user_id}/{uuid4()}_{file.filename}"
        content = await file.read()
        self.s3.put_object(
            Bucket=self.bucket,
            Key=file_key,
            Body=content,
            ContentType=file.content_type
        )
        url = f"https://{self.bucket}.s3.amazonaws.com/{file_key}"
        return {
            "url": url,
            "path": file_key,
            "size": len(content),
            "content_type": file.content_type
        }

    async def delete_file(self, path: str) -> bool:
        self.s3.delete_object(Bucket=self.bucket, Key=path)
        return True

    async def get_signed_url(self, path: str, expiration_minutes: int = 60) -> str:
        return self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': path},
            ExpiresIn=expiration_minutes * 60
        )

def get_storage_service():
    """
    Factory to return the configured storage service.
    """
    provider = settings.STORAGE_PROVIDER.lower()
    
    if provider == "firebase":
        return FirebaseStorageService()
    elif provider == "s3":
        return S3StorageService()
    else:
        return LocalStorageService()
