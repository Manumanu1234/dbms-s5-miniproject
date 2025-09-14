from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.db_operations import get_db_ops, DonorOperations
from app.schemas.donor import DonorCreate, DonorUpdate, Donor as DonorSchema
from app.api.deps import get_current_user, get_current_admin_user
import uuid

router = APIRouter()


@router.get("/", response_model=List[DonorSchema])
def get_donors(
    skip: int = 0,
    limit: int = 100
):
    """Get all donors"""
    db_ops = get_db_ops()
    donor_ops = DonorOperations(db_ops)
    return donor_ops.get_all_donors(limit=limit, offset=skip)


@router.get("/me", response_model=DonorSchema)
def get_my_donor_profile(
    current_user = Depends(get_current_user)
):
    """Get current user's donor profile"""
    db_ops = get_db_ops()
    donor_ops = DonorOperations(db_ops)
    
    donor = donor_ops.get_donor_by_user_id(current_user['id'])
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor profile not found"
        )
    
    return donor


@router.post("/", response_model=DonorSchema)
def create_donor_profile(
    donor_data: DonorCreate
):
    """Create donor profile"""
    from app.core.db_operations import get_db_ops, DonorOperations, UserOperations
    import uuid
    
    try:
        db_ops = get_db_ops()
        donor_ops = DonorOperations(db_ops)
        user_ops = UserOperations(db_ops)
        
        # Check if user with this email already exists
        existing_user = user_ops.get_user_by_email(donor_data.email)
        
        if existing_user:
            # Use existing user ID
            user_id = existing_user['id']
            
            # Check if donor profile already exists for this user
            existing_donor = donor_ops.get_donor_by_user_id(user_id)
            if existing_donor:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Donor profile already exists for this email"
                )
        else:
            # Create new user record
            temp_user_id = str(uuid.uuid4())
            user_dict = {
                "id": temp_user_id,
                "email": donor_data.email,
                "password": "temp_password",  # Temporary password
                "role": "donor"
            }
            db_ops.create_record("users", user_dict)
            user_id = temp_user_id
        
        # Create donor profile
        donor_dict = {
            "name": donor_data.name,
            "email": donor_data.email,
            "phone": donor_data.phone,
            "blood_type": donor_data.blood_type.value,
            "age": donor_data.age,
            "weight": donor_data.weight,
            "address": donor_data.address,
            "medical_history": donor_data.medical_history,
            "donation_units": donor_data.donation_units or 1
        }
        
        return donor_ops.create_donor(user_id, donor_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating donor profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating donor profile: {str(e)}"
        )


@router.put("/me", response_model=DonorSchema)
def update_my_donor_profile(
    donor_update: DonorUpdate
):
    """Update donor profile"""
    db_ops = get_db_ops()
    donor_ops = DonorOperations(db_ops)
    
    # Get the first donor for update (since we removed authentication)
    all_donors = donor_ops.get_all_donors(limit=1)
    if not all_donors:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No donor profiles found"
        )
    existing_donor = all_donors[0]
    
    # Build update data
    update_data = {}
    if donor_update.name is not None:
        update_data["name"] = donor_update.name
    if donor_update.phone is not None:
        update_data["phone"] = donor_update.phone
    if donor_update.blood_type is not None:
        update_data["blood_type"] = donor_update.blood_type.value
    if donor_update.age is not None:
        update_data["age"] = donor_update.age
    if donor_update.weight is not None:
        update_data["weight"] = donor_update.weight
    if donor_update.address is not None:
        update_data["address"] = donor_update.address
    if donor_update.medical_history is not None:
        update_data["medical_history"] = donor_update.medical_history
    if donor_update.donation_units is not None:
        update_data["donation_units"] = donor_update.donation_units
    if donor_update.is_eligible is not None:
        update_data["is_eligible"] = donor_update.is_eligible
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    return db_ops.update_record("donors", existing_donor['id'], update_data)


@router.put("/{donor_id}/eligibility", response_model=DonorSchema)
def update_donor_eligibility(
    donor_id: str,
    eligibility_data: dict,
    current_user = Depends(get_current_admin_user)
):
    """Update donor eligibility (admin only)"""
    db_ops = get_db_ops()
    donor_ops = DonorOperations(db_ops)
    
    # Check if donor exists
    donor = db_ops.get_record_by_id("donors", donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    is_eligible = eligibility_data.get("is_eligible", True)
    return donor_ops.update_donor_eligibility(donor_id, is_eligible)


@router.get("/eligible", response_model=List[DonorSchema])
def get_eligible_donors(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin_user)
):
    """Get all eligible donors (admin only)"""
    db_ops = get_db_ops()
    donor_ops = DonorOperations(db_ops)
    return donor_ops.get_eligible_donors()


@router.get("/ineligible", response_model=List[DonorSchema])
def get_ineligible_donors(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin_user)
):
    """Get all ineligible donors (admin only)"""
    db_ops = get_db_ops()
    donor_ops = DonorOperations(db_ops)
    return donor_ops.get_ineligible_donors()


@router.get("/{donor_id}", response_model=DonorSchema)
def get_donor(
    donor_id: str,
    current_user = Depends(get_current_admin_user)
):
    """Get specific donor (admin only)"""
    db_ops = get_db_ops()
    
    donor = db_ops.get_record_by_id("donors", donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    return donor
