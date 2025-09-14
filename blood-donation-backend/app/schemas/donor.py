from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.donor import BloodType


class DonorBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    blood_type: BloodType
    age: int
    weight: int
    address: str
    medical_history: Optional[str] = None
    donation_units: Optional[int] = 1


class DonorCreate(DonorBase):
    pass


class DonorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    blood_type: Optional[BloodType] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    donation_units: Optional[int] = None
    is_eligible: Optional[bool] = None


class DonorInDB(DonorBase):
    id: str
    user_id: str
    last_donation_date: Optional[datetime] = None
    is_eligible: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Donor(DonorInDB):
    pass
