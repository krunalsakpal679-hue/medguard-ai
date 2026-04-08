from datetime import datetime
from typing import Optional, Any, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

class AuditLogEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actor_id: str  # The user/admin performing the action
    action: str    # e.g., USER_UPDATED, DRUG_DELETED
    target_type: str # e.g., USER, DRUG, PREDICTION
    target_id: Optional[str] = None
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None

class AuditLogger:
    """
    High-fidelity clinical audit logging for regulatory compliance.
    """
    def __init__(self, collection_name: str = "audit_logs"):
        self.collection_name = collection_name

    async def log_action(
        self,
        db: AsyncIOMotorDatabase,
        actor_id: str,
        action: str,
        target_type: str,
        target_id: Optional[str] = None,
        details: Dict[str, Any] = {},
        ip: Optional[str] = None
    ) -> None:
        """
        Records a system action with atomicity and precision.
        """
        entry = AuditLogEntry(
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip
        )
        
        await db[self.collection_name].insert_one(entry.dict())

# Global singleton
audit_logger = AuditLogger()
