import enum
from datetime import datetime
from typing import Dict, Any
import uuid


class BloodType(str, enum.Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"


class BloodInventory:
    def __init__(self, blood_type: BloodType, units_available: int, expiry_date: datetime,
                 id: str = None):
        self.id = id or str(uuid.uuid4())
        self.blood_type = blood_type
        self.units_available = units_available
        self.expiry_date = expiry_date
        self.last_updated = datetime.now()
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert blood inventory object to dictionary"""
        return {
            "id": self.id,
            "blood_type": self.blood_type.value,
            "units_available": self.units_available,
            "expiry_date": self.expiry_date,
            "last_updated": self.last_updated,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BloodInventory':
        """Create blood inventory object from dictionary"""
        inventory = cls(
            blood_type=BloodType(data["blood_type"]),
            units_available=data["units_available"],
            expiry_date=data["expiry_date"],
            id=data.get("id")
        )
        if "last_updated" in data:
            inventory.last_updated = data["last_updated"]
        if "created_at" in data:
            inventory.created_at = data["created_at"]
        if "updated_at" in data:
            inventory.updated_at = data["updated_at"]
        return inventory
