from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.database import get_db
from app.schemas.donation_event import DonationEventCreate, DonationEventUpdate, DonationEvent as DonationEventSchema, EventRegistration
from app.api.deps import get_current_user, get_current_admin_user
import uuid
import json

router = APIRouter()


@router.get("/", response_model=List[DonationEventSchema])
def get_events(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db = Depends(get_db)
):
    """Get all events (public endpoint)"""
    query = "SELECT * FROM donation_events WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = %s"
        params.append(status)
    
    query += " ORDER BY date DESC LIMIT %s OFFSET %s"
    params.extend([limit, skip])
    
    events = db.execute_query(query, tuple(params))
    
    # Parse JSON fields
    for event in events:
        if event['registered_donors']:
            event['registered_donors'] = json.loads(event['registered_donors'])
        else:
            event['registered_donors'] = []
    
    return events


@router.post("/", response_model=DonationEventSchema)
def create_event(
    event_data: DonationEventCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Create event (admin only)"""
    event_id = str(uuid.uuid4())
    db.execute_insert(
        """INSERT INTO donation_events (id, title, description, date, time, location, 
           address, capacity, registered_donors, organizer, status) 
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (event_id, event_data.title, event_data.description, event_data.date, event_data.time,
         event_data.location, event_data.address, event_data.capacity, json.dumps([]),
         event_data.organizer, 'upcoming')
    )
    
    # Get the created event
    created_event = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )[0]
    
    # Parse JSON fields
    created_event['registered_donors'] = json.loads(created_event['registered_donors'])
    
    return created_event


@router.get("/{event_id}", response_model=DonationEventSchema)
def get_event(
    event_id: str,
    db = Depends(get_db)
):
    """Get specific event (public endpoint)"""
    events = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )
    
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event = events[0]
    # Parse JSON fields
    event['registered_donors'] = json.loads(event['registered_donors'])
    
    return event


@router.put("/{event_id}", response_model=DonationEventSchema)
def update_event(
    event_id: str,
    event_update: DonationEventUpdate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update event (admin only)"""
    events = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )
    
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if event_update.title is not None:
        update_fields.append("title = %s")
        update_values.append(event_update.title)
    
    if event_update.description is not None:
        update_fields.append("description = %s")
        update_values.append(event_update.description)
    
    if event_update.date is not None:
        update_fields.append("date = %s")
        update_values.append(event_update.date)
    
    if event_update.time is not None:
        update_fields.append("time = %s")
        update_values.append(event_update.time)
    
    if event_update.location is not None:
        update_fields.append("location = %s")
        update_values.append(event_update.location)
    
    if event_update.address is not None:
        update_fields.append("address = %s")
        update_values.append(event_update.address)
    
    if event_update.capacity is not None:
        update_fields.append("capacity = %s")
        update_values.append(event_update.capacity)
    
    if event_update.organizer is not None:
        update_fields.append("organizer = %s")
        update_values.append(event_update.organizer)
    
    if event_update.status is not None:
        update_fields.append("status = %s")
        update_values.append(event_update.status.value)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add event_id to the end for WHERE clause
    update_values.append(event_id)
    
    query = f"UPDATE donation_events SET {', '.join(update_fields)} WHERE id = %s"
    db.execute_update(query, tuple(update_values))
    
    # Get the updated event
    updated_event = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )[0]
    
    # Parse JSON fields
    updated_event['registered_donors'] = json.loads(updated_event['registered_donors'])
    
    return updated_event


@router.post("/{event_id}/register", response_model=DonationEventSchema)
def register_for_event(
    event_id: str,
    registration: EventRegistration,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Register for event (authenticated users)"""
    events = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )
    
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event = events[0]
    registered_donors = json.loads(event['registered_donors']) if event['registered_donors'] else []
    
    if event['status'] != "upcoming":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is not available for registration"
        )
    
    if len(registered_donors) >= event['capacity']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is full"
        )
    
    if registration.donor_id in registered_donors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this event"
        )
    
    registered_donors.append(registration.donor_id)
    
    db.execute_update(
        "UPDATE donation_events SET registered_donors = %s WHERE id = %s",
        (json.dumps(registered_donors), event_id)
    )
    
    # Get the updated event
    updated_event = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )[0]
    
    # Parse JSON fields
    updated_event['registered_donors'] = json.loads(updated_event['registered_donors'])
    
    return updated_event


@router.delete("/{event_id}/unregister", response_model=DonationEventSchema)
def unregister_from_event(
    event_id: str,
    registration: EventRegistration,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Unregister from event (authenticated users)"""
    events = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )
    
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event = events[0]
    registered_donors = json.loads(event['registered_donors']) if event['registered_donors'] else []
    
    if registration.donor_id not in registered_donors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not registered for this event"
        )
    
    registered_donors.remove(registration.donor_id)
    
    db.execute_update(
        "UPDATE donation_events SET registered_donors = %s WHERE id = %s",
        (json.dumps(registered_donors), event_id)
    )
    
    # Get the updated event
    updated_event = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )[0]
    
    # Parse JSON fields
    updated_event['registered_donors'] = json.loads(updated_event['registered_donors'])
    
    return updated_event


@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete event (admin only)"""
    events = db.execute_query(
        "SELECT * FROM donation_events WHERE id = %s",
        (event_id,)
    )
    
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    db.execute_update(
        "DELETE FROM donation_events WHERE id = %s",
        (event_id,)
    )
    
    return {"message": "Event deleted successfully"}
