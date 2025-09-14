from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.donation_event import EventStatus


class DonationEventBase(BaseModel):
    title: str
    description: str
    date: datetime
    time: str
    location: str
    address: str
    capacity: int
    organizer: str


class DonationEventCreate(DonationEventBase):
    pass


class DonationEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    organizer: Optional[str] = None
    status: Optional[EventStatus] = None


class DonationEventInDB(DonationEventBase):
    id: str
    registered_donors: List[str]
    status: EventStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DonationEvent(DonationEventInDB):
    pass


class EventRegistration(BaseModel):
    donor_id: str
