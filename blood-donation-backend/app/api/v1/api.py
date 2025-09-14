from fastapi import APIRouter
from app.api.v1 import auth, donors, blood_requests, events, donation_records, dashboard, receivers, database_test

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(donors.router, prefix="/donors", tags=["donors"])
api_router.include_router(receivers.router, prefix="/receivers", tags=["receivers"])
api_router.include_router(blood_requests.router, prefix="/blood-requests", tags=["blood-requests"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(donation_records.router, prefix="/donation-records", tags=["donation-records"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(database_test.router, prefix="/database-test", tags=["database-test"])
