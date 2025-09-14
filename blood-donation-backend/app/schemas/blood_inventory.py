from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.blood_inventory import BloodType


class BloodInventoryBase(BaseModel):
    blood_type: BloodType
    units_available: int
    expiry_date: datetime


class BloodInventoryCreate(BloodInventoryBase):
    pass


class BloodInventoryUpdate(BaseModel):
    units_available: Optional[int] = None
    expiry_date: Optional[datetime] = None


class BloodInventoryInDB(BloodInventoryBase):
    id: str
    last_updated: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BloodInventory(BloodInventoryInDB):
    pass
