import enum
from datetime import datetime
from typing import Optional, Dict, Any
import uuid


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DONOR = "donor" 
    RECEIVER = "recv"  # Shortened to fit database column constraints


class User:
    def __init__(self, email: str, password: str, role: UserRole, id: str = None):
        self.id = id or str(uuid.uuid4())
        self.email = email
        self.password = password
        self.role = role
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "password": self.password,
            "role": self.role.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create user object from dictionary"""
        user = cls(
            email=data["email"],
            password=data["password"],
            role=UserRole(data["role"]),
            id=data.get("id")
        )
        if "created_at" in data:
            user.created_at = data["created_at"]
        if "updated_at" in data:
            user.updated_at = data["updated_at"]
        return user
