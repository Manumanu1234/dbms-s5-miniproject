import enum
from datetime import datetime
from typing import Optional, Dict, Any
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


class Donor:
    def __init__(self, user_id: str, name: str, email: str, phone: str, 
                 blood_type: BloodType, age: int, weight: int, address: str,
                 medical_history: Optional[str] = None, last_donation_date: Optional[datetime] = None,
                 is_eligible: bool = True, id: str = None):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.name = name
        self.email = email
        self.phone = phone
        self.blood_type = blood_type
        self.age = age
        self.weight = weight
        self.address = address
        self.medical_history = medical_history
        self.last_donation_date = last_donation_date
        self.is_eligible = is_eligible
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert donor object to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "blood_type": self.blood_type.value,
            "age": self.age,
            "weight": self.weight,
            "address": self.address,
            "medical_history": self.medical_history,
            "last_donation_date": self.last_donation_date,
            "is_eligible": self.is_eligible,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Donor':
        """Create donor object from dictionary"""
        donor = cls(
            user_id=data["user_id"],
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            blood_type=BloodType(data["blood_type"]),
            age=data["age"],
            weight=data["weight"],
            address=data["address"],
            medical_history=data.get("medical_history"),
            last_donation_date=data.get("last_donation_date"),
            is_eligible=data.get("is_eligible", True),
            id=data.get("id")
        )
        if "created_at" in data:
            donor.created_at = data["created_at"]
        if "updated_at" in data:
            donor.updated_at = data["updated_at"]
        return donor
