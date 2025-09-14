from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.db_operations import get_db_ops, ReceiverOperations, BloodRequestOperations
from app.schemas.blood_receiver import BloodReceiverCreate, BloodReceiverUpdate, BloodReceiver as BloodReceiverSchema
from app.api.deps import get_current_user, get_current_admin_user, get_current_receiver_user
import uuid

router = APIRouter()


@router.get("/", response_model=List[BloodReceiverSchema])
def get_receivers(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin_user)
):
    """Get all receivers (admin only)"""
    db_ops = get_db_ops()
    receiver_ops = ReceiverOperations(db_ops)
    return receiver_ops.get_all_receivers(limit=limit, offset=skip)


@router.get("/me", response_model=BloodReceiverSchema)
def get_my_receiver_profile(
    current_user = Depends(get_current_user)
):
    """Get current user's receiver profile"""
    db_ops = get_db_ops()
    receiver_ops = ReceiverOperations(db_ops)
    
    receiver = receiver_ops.get_receiver_by_user_id(current_user['id'])
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver profile not found"
        )
    
    return receiver


@router.post("/", response_model=BloodReceiverSchema)
def create_receiver_profile(
    receiver_data: BloodReceiverCreate,
    current_user = Depends(get_current_user)
):
    """Create receiver profile"""
    db_ops = get_db_ops()
    receiver_ops = ReceiverOperations(db_ops)
    
    # Check if receiver profile already exists
    existing_receiver = receiver_ops.get_receiver_by_user_id(current_user['id'])
    if existing_receiver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Receiver profile already exists"
        )
    
    # Create receiver profile
    receiver_dict = {
        "name": receiver_data.name,
        "email": receiver_data.email,
        "phone": receiver_data.phone,
        "blood_type": receiver_data.blood_type.value,
        "address": receiver_data.address,
        "emergency_contact": receiver_data.emergency_contact,
        "medical_conditions": receiver_data.medical_conditions,
        "urgency_level": receiver_data.urgency_level.value if receiver_data.urgency_level else "medium",
        "units_needed": receiver_data.units_needed or 1,
        "hospital_name": receiver_data.hospital_name,
        "doctor_name": receiver_data.doctor_name,
        "medical_condition": receiver_data.medical_condition,
        "notes": receiver_data.notes
    }
    
    return receiver_ops.create_receiver(current_user['id'], receiver_dict)


@router.put("/me", response_model=BloodReceiverSchema)
def update_my_receiver_profile(
    receiver_update: BloodReceiverUpdate,
    current_user = Depends(get_current_user)
):
    """Update current user's receiver profile"""
    db_ops = get_db_ops()
    receiver_ops = ReceiverOperations(db_ops)
    
    # Check if receiver exists
    existing_receiver = receiver_ops.get_receiver_by_user_id(current_user['id'])
    if not existing_receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver profile not found"
        )
    
    # Build update data
    update_data = {}
    if receiver_update.name is not None:
        update_data["name"] = receiver_update.name
    if receiver_update.phone is not None:
        update_data["phone"] = receiver_update.phone
    if receiver_update.blood_type is not None:
        update_data["blood_type"] = receiver_update.blood_type.value
    if receiver_update.address is not None:
        update_data["address"] = receiver_update.address
    if receiver_update.emergency_contact is not None:
        update_data["emergency_contact"] = receiver_update.emergency_contact
    if receiver_update.medical_conditions is not None:
        update_data["medical_conditions"] = receiver_update.medical_conditions
    if receiver_update.urgency_level is not None:
        update_data["urgency_level"] = receiver_update.urgency_level.value
    if receiver_update.units_needed is not None:
        update_data["units_needed"] = receiver_update.units_needed
    if receiver_update.hospital_name is not None:
        update_data["hospital_name"] = receiver_update.hospital_name
    if receiver_update.doctor_name is not None:
        update_data["doctor_name"] = receiver_update.doctor_name
    if receiver_update.medical_condition is not None:
        update_data["medical_condition"] = receiver_update.medical_condition
    if receiver_update.status is not None:
        update_data["status"] = receiver_update.status.value
    if receiver_update.notes is not None:
        update_data["notes"] = receiver_update.notes
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    return db_ops.update_record("blood_receivers", existing_receiver['id'], update_data)


@router.get("/{receiver_id}", response_model=BloodReceiverSchema)
def get_receiver(
    receiver_id: str,
    current_user = Depends(get_current_admin_user)
):
    """Get specific receiver (admin only)"""
    db_ops = get_db_ops()
    
    receiver = db_ops.get_record_by_id("blood_receivers", receiver_id)
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    return receiver
