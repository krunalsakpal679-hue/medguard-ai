import json
import logging
from uuid import uuid4
from datetime import timedelta
import firebase_admin
from firebase_admin import credentials, storage
from fastapi import UploadFile
from app.core.config import settings

logger = logging.getLogger(__name__)

class FirebaseStorageService:
    def __init__(self):
        try:
            # Check if app is already initialized
            self.app = firebase_admin.get_app()
        except ValueError:
            # Initialize with service account credentials from settings
            # settings.FIREBASE_CREDENTIALS should be a dict or a path to JSON
            cred_data = settings.FIREBASE_CREDENTIALS
            if isinstance(cred_data, str):
                try:
                    cred_data = json.loads(cred_data)
                except json.JSONDecodeError:
                    # Assume it's a file path
                    pass
            
            cred = credentials.Certificate(cred_data)
            self.app = firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
        
        self.bucket = storage.bucket(app=self.app)

    async def upload_file(self, file: UploadFile, user_id: str) -> dict:
        """
        Uploads a file to Firebase Storage.
        """
        filename = file.filename
        file_extension = filename.split(".")[-1] if "." in filename else ""
        unique_filename = f"{uuid4()}.{file_extension}"
        storage_path = f"prescriptions/{user_id}/{unique_filename}"
        
        blob = self.bucket.blob(storage_path)
        file_bytes = await file.read()
        
        # Upload from string (bytes)
        blob.upload_from_string(
            file_bytes,
            content_type=file.content_type
        )
        
        # Make public for easy access (or use signed URLs for higher security)
        blob.make_public()
        
        return {
            "url": blob.public_url,
            "path": storage_path,
            "size": len(file_bytes),
            "content_type": file.content_type
        }

    async def delete_file(self, path: str) -> bool:
        """
        Deletes a blob from the bucket.
        """
        try:
            blob = self.bucket.blob(path)
            blob.delete()
            return True
        except Exception as e:
            logger.error(f"Failed to delete Firebase blob at {path}: {e}")
            return False

    async def get_signed_url(self, path: str, expiration_minutes: int = 60) -> str:
        """
        Generates a temporary signed URL for a private blob.
        """
        blob = self.bucket.blob(path)
        url = blob.generate_signed_url(
            expiration=timedelta(minutes=expiration_minutes),
            method='GET'
        )
        return url
