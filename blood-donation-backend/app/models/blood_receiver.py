import enum
from datetime import datetime
from typing import Dict, Any, Optional
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


class BloodReceiver:
    """Blood receiver profile model"""
    def __init__(self, user_id: str, name: str, email: str, phone: str, 
                 blood_type: BloodType, address: str, emergency_contact: Optional[str] = None,
                 medical_conditions: Optional[str] = None, id: str = None):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.name = name
        self.email = email
        self.phone = phone
        self.blood_type = blood_type
        self.address = address
        self.emergency_contact = emergency_contact
        self.medical_conditions = medical_conditions
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert blood receiver object to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "blood_type": self.blood_type.value,
            "address": self.address,
            "emergency_contact": self.emergency_contact,
            "medical_conditions": self.medical_conditions,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BloodReceiver':
        """Create blood receiver object from dictionary"""
        receiver = cls(
            user_id=data["user_id"],
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            blood_type=BloodType(data["blood_type"]),
            address=data["address"],
            emergency_contact=data.get("emergency_contact"),
            medical_conditions=data.get("medical_conditions"),
            id=data.get("id")
        )
        if "created_at" in data:
            receiver.created_at = data["created_at"]
        if "updated_at" in data:
            receiver.updated_at = data["updated_at"]
        return receiver


class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"


class BloodRequest:
    """Blood request model"""
    def __init__(self, receiver_id: str, blood_type: BloodType, urgency_level: UrgencyLevel,
                 units_needed: int, hospital_name: str, doctor_name: str, medical_condition: str,
                 status: RequestStatus = RequestStatus.PENDING, notes: Optional[str] = None,
                 id: str = None):
        self.id = id or str(uuid.uuid4())
        self.receiver_id = receiver_id
        self.blood_type = blood_type
        self.urgency_level = urgency_level
        self.units_needed = units_needed
        self.hospital_name = hospital_name
        self.doctor_name = doctor_name
        self.medical_condition = medical_condition
        self.request_date = datetime.now()
        self.status = status
        self.notes = notes
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert blood request object to dictionary"""
        return {
            "id": self.id,
            "receiver_id": self.receiver_id,
            "blood_type": self.blood_type.value,
            "urgency_level": self.urgency_level.value,
            "units_needed": self.units_needed,
            "hospital_name": self.hospital_name,
            "doctor_name": self.doctor_name,
            "medical_condition": self.medical_condition,
            "request_date": self.request_date,
            "status": self.status.value,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BloodRequest':
        """Create blood request object from dictionary"""
        request = cls(
            receiver_id=data["receiver_id"],
            blood_type=BloodType(data["blood_type"]),
            urgency_level=UrgencyLevel(data["urgency_level"]),
            units_needed=data["units_needed"],
            hospital_name=data["hospital_name"],
            doctor_name=data["doctor_name"],
            medical_condition=data["medical_condition"],
            status=RequestStatus(data.get("status", "pending")),
            notes=data.get("notes"),
            id=data.get("id")
        )
        if "request_date" in data:
            request.request_date = data["request_date"]
        if "created_at" in data:
            request.created_at = data["created_at"]
        if "updated_at" in data:
            request.updated_at = data["updated_at"]
        return request
