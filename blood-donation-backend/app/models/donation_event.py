import enum
from datetime import datetime
from typing import Dict, Any, List
import uuid


class EventStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DonationEvent:
    def __init__(self, title: str, description: str, date: datetime, time: str,
                 location: str, address: str, capacity: int, organizer: str,
                 registered_donors: List[str] = None, status: EventStatus = EventStatus.UPCOMING,
                 id: str = None):
        self.id = id or str(uuid.uuid4())
        self.title = title
        self.description = description
        self.date = date
        self.time = time
        self.location = location
        self.address = address
        self.capacity = capacity
        self.registered_donors = registered_donors or []
        self.organizer = organizer
        self.status = status
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert donation event object to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "address": self.address,
            "capacity": self.capacity,
            "registered_donors": self.registered_donors,
            "organizer": self.organizer,
            "status": self.status.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DonationEvent':
        """Create donation event object from dictionary"""
        event = cls(
            title=data["title"],
            description=data["description"],
            date=data["date"],
            time=data["time"],
            location=data["location"],
            address=data["address"],
            capacity=data["capacity"],
            organizer=data["organizer"],
            registered_donors=data.get("registered_donors", []),
            status=EventStatus(data.get("status", "upcoming")),
            id=data.get("id")
        )
        if "created_at" in data:
            event.created_at = data["created_at"]
        if "updated_at" in data:
            event.updated_at = data["updated_at"]
        return event
