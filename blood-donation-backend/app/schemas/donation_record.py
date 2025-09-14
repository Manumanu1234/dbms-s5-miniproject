from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.donation_record import BloodType, DonationStatus


class TestResults(BaseModel):
    hiv: bool
    hepatitis_b: bool
    hepatitis_c: bool
    syphilis: bool


class DonationRecordBase(BaseModel):
    donor_id: str
    event_id: Optional[str] = None
    donation_date: datetime
    blood_type: BloodType
    units_collected: int
    hiv_test: bool = False
    hepatitis_b_test: bool = False
    hepatitis_c_test: bool = False
    syphilis_test: bool = False
    status: DonationStatus = DonationStatus.COLLECTED
    notes: Optional[str] = None


class DonationRecordCreate(DonationRecordBase):
    pass


class DonationRecordUpdate(BaseModel):
    event_id: Optional[str] = None
    donation_date: Optional[datetime] = None
    blood_type: Optional[BloodType] = None
    units_collected: Optional[int] = None
    hiv_test: Optional[bool] = None
    hepatitis_b_test: Optional[bool] = None
    hepatitis_c_test: Optional[bool] = None
    syphilis_test: Optional[bool] = None
    status: Optional[DonationStatus] = None
    notes: Optional[str] = None


class DonationRecordInDB(DonationRecordBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DonationRecord(DonationRecordInDB):
    test_results: TestResults

    @property
    def test_results(self) -> TestResults:
        return TestResults(
            hiv=self.hiv_test,
            hepatitis_b=self.hepatitis_b_test,
            hepatitis_c=self.hepatitis_c_test,
            syphilis=self.syphilis_test
        )
