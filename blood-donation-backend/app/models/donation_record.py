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


class DonationStatus(str, enum.Enum):
    COLLECTED = "collected"
    TESTED = "tested"
    APPROVED = "approved"
    REJECTED = "rejected"


class DonationRecord:
    def __init__(self, donor_id: str, donation_date: datetime, blood_type: BloodType,
                 units_collected: int, event_id: Optional[str] = None, hiv_test: bool = False,
                 hepatitis_b_test: bool = False, hepatitis_c_test: bool = False,
                 syphilis_test: bool = False, status: DonationStatus = DonationStatus.COLLECTED,
                 notes: Optional[str] = None, id: str = None):
        self.id = id or str(uuid.uuid4())
        self.donor_id = donor_id
        self.event_id = event_id
        self.donation_date = donation_date
        self.blood_type = blood_type
        self.units_collected = units_collected
        self.hiv_test = hiv_test
        self.hepatitis_b_test = hepatitis_b_test
        self.hepatitis_c_test = hepatitis_c_test
        self.syphilis_test = syphilis_test
        self.status = status
        self.notes = notes
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert donation record object to dictionary"""
        return {
            "id": self.id,
            "donor_id": self.donor_id,
            "event_id": self.event_id,
            "donation_date": self.donation_date,
            "blood_type": self.blood_type.value,
            "units_collected": self.units_collected,
            "hiv_test": self.hiv_test,
            "hepatitis_b_test": self.hepatitis_b_test,
            "hepatitis_c_test": self.hepatitis_c_test,
            "syphilis_test": self.syphilis_test,
            "status": self.status.value,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DonationRecord':
        """Create donation record object from dictionary"""
        record = cls(
            donor_id=data["donor_id"],
            donation_date=data["donation_date"],
            blood_type=BloodType(data["blood_type"]),
            units_collected=data["units_collected"],
            event_id=data.get("event_id"),
            hiv_test=data.get("hiv_test", False),
            hepatitis_b_test=data.get("hepatitis_b_test", False),
            hepatitis_c_test=data.get("hepatitis_c_test", False),
            syphilis_test=data.get("syphilis_test", False),
            status=DonationStatus(data.get("status", "collected")),
            notes=data.get("notes"),
            id=data.get("id")
        )
        if "created_at" in data:
            record.created_at = data["created_at"]
        if "updated_at" in data:
            record.updated_at = data["updated_at"]
        return record
