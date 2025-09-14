from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.db_operations import get_db_ops, ReceiverOperations
from app.api.deps import get_current_admin_user

router = APIRouter()


@router.get("/", response_model=List[dict])
def get_blood_receivers(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    urgency_level: str = None
):
    """Get all blood receivers (admin only)"""
    try:
        db_ops = get_db_ops()
        receiver_ops = ReceiverOperations(db_ops)
        
        # Get all receivers
        receivers = receiver_ops.get_all_receivers(limit=limit, offset=skip)
        
        # Apply filters if provided
        if status_filter:
            receivers = [r for r in receivers if r.get('status') == status_filter]
        if urgency_level:
            receivers = [r for r in receivers if r.get('urgency_level') == urgency_level]
        
        return receivers
    except Exception as e:
        print(f"Error fetching blood receivers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching blood receivers: {str(e)}"
        )


@router.put("/{receiver_id}/status", response_model=dict)
def update_receiver_status(
    receiver_id: str,
    status_data: dict
):
    """Update blood receiver status (admin only)"""
    try:
        new_status = status_data.get("new_status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="new_status is required"
            )
        
        db_ops = get_db_ops()
        
        # Check if receiver exists
        receiver = db_ops.get_record_by_id("blood_receivers", receiver_id)
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blood receiver not found"
            )
        
        # Update status
        updated_receiver = db_ops.update_record("blood_receivers", receiver_id, {"status": new_status})
        return updated_receiver
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating receiver status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating receiver status: {str(e)}"
        )

