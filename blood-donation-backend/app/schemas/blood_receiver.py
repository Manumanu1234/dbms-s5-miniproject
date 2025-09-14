from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.blood_receiver import BloodType, UrgencyLevel, RequestStatus


# Blood Receiver Profile Schemas (unified with request fields)
class BloodReceiverBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    blood_type: BloodType
    address: str
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[str] = None
    urgency_level: Optional[UrgencyLevel] = UrgencyLevel.MEDIUM
    units_needed: Optional[int] = 1
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    medical_condition: Optional[str] = None
    notes: Optional[str] = None


class BloodReceiverCreate(BloodReceiverBase):
    pass


class BloodReceiverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    blood_type: Optional[BloodType] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[str] = None
    urgency_level: Optional[UrgencyLevel] = None
    units_needed: Optional[int] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    medical_condition: Optional[str] = None
    status: Optional[RequestStatus] = None
    notes: Optional[str] = None


class BloodReceiverInDB(BloodReceiverBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BloodReceiver(BloodReceiverInDB):
    pass


# Blood Request Schemas
class BloodRequestBase(BaseModel):
    blood_type: BloodType
    urgency_level: UrgencyLevel
    units_needed: int
    hospital_name: str
    doctor_name: str
    medical_condition: str
    notes: Optional[str] = None


class BloodRequestCreate(BloodRequestBase):
    pass


class BloodRequestUpdate(BaseModel):
    blood_type: Optional[BloodType] = None
    urgency_level: Optional[UrgencyLevel] = None
    units_needed: Optional[int] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    medical_condition: Optional[str] = None
    status: Optional[RequestStatus] = None
    notes: Optional[str] = None


class BloodRequestInDB(BloodRequestBase):
    id: str
    receiver_id: str
    request_date: datetime
    status: RequestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BloodRequest(BloodRequestInDB):
    pass
