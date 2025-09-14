from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.database import get_db
from app.schemas.donation_record import DonationRecordCreate, DonationRecordUpdate, DonationRecord as DonationRecordSchema
from app.api.deps import get_current_user, get_current_admin_user
import uuid

router = APIRouter()


@router.get("/", response_model=List[DonationRecordSchema])
def get_donation_records(
    skip: int = 0,
    limit: int = 100,
    donor_id: str = None,
    db = Depends(get_db)
):
    """Get all donation records (admin only)"""
    query = "SELECT * FROM donation_records WHERE 1=1"
    params = []
    
    if donor_id:
        query += " AND donor_id = %s"
        params.append(donor_id)
    
    query += " ORDER BY donation_date DESC LIMIT %s OFFSET %s"
    params.extend([limit, skip])
    
    records = db.execute_query(query, tuple(params))
    
    # Add test_results field to each record
    for record in records:
        record['test_results'] = {
            'hiv': record['hiv_test'],
            'hepatitis_b': record['hepatitis_b_test'],
            'hepatitis_c': record['hepatitis_c_test'],
            'syphilis': record['syphilis_test']
        }
    
    return records


@router.get("/my-records", response_model=List[DonationRecordSchema])
def get_my_donation_records(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's donation records"""
    # Get donor profile
    donors = db.execute_query(
        "SELECT * FROM donors WHERE user_id = %s",
        (current_user['id'],)
    )
    
    if not donors:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor profile not found"
        )
    
    donor = donors[0]
    records = db.execute_query(
        "SELECT * FROM donation_records WHERE donor_id = %s ORDER BY donation_date DESC",
        (donor['id'],)
    )
    
    # Add test_results field to each record
    for record in records:
        record['test_results'] = {
            'hiv': record['hiv_test'],
            'hepatitis_b': record['hepatitis_b_test'],
            'hepatitis_c': record['hepatitis_c_test'],
            'syphilis': record['syphilis_test']
        }
    
    return records


@router.post("/", response_model=DonationRecordSchema)
def create_donation_record(
    record_data: DonationRecordCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Create donation record (admin only)"""
    record_id = str(uuid.uuid4())
    db.execute_insert(
        """INSERT INTO donation_records (id, donor_id, event_id, donation_date, blood_type, 
           units_collected, hiv_test, hepatitis_b_test, hepatitis_c_test, syphilis_test, 
           status, notes) 
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (record_id, record_data.donor_id, record_data.event_id, record_data.donation_date,
         record_data.blood_type.value, record_data.units_collected, record_data.hiv_test,
         record_data.hepatitis_b_test, record_data.hepatitis_c_test, record_data.syphilis_test,
         record_data.status.value, record_data.notes)
    )
    
    # Get the created record
    created_record = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )[0]
    
    # Add test_results field
    created_record['test_results'] = {
        'hiv': created_record['hiv_test'],
        'hepatitis_b': created_record['hepatitis_b_test'],
        'hepatitis_c': created_record['hepatitis_c_test'],
        'syphilis': created_record['syphilis_test']
    }
    
    return created_record


@router.get("/{record_id}", response_model=DonationRecordSchema)
def get_donation_record(
    record_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get specific donation record (admin only)"""
    records = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )
    
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found"
        )
    
    record = records[0]
    # Add test_results field
    record['test_results'] = {
        'hiv': record['hiv_test'],
        'hepatitis_b': record['hepatitis_b_test'],
        'hepatitis_c': record['hepatitis_c_test'],
        'syphilis': record['syphilis_test']
    }
    
    return record


@router.put("/{record_id}", response_model=DonationRecordSchema)
def update_donation_record(
    record_id: str,
    record_update: DonationRecordUpdate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update donation record (admin only)"""
    records = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )
    
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found"
        )
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if record_update.event_id is not None:
        update_fields.append("event_id = %s")
        update_values.append(record_update.event_id)
    
    if record_update.donation_date is not None:
        update_fields.append("donation_date = %s")
        update_values.append(record_update.donation_date)
    
    if record_update.blood_type is not None:
        update_fields.append("blood_type = %s")
        update_values.append(record_update.blood_type.value)
    
    if record_update.units_collected is not None:
        update_fields.append("units_collected = %s")
        update_values.append(record_update.units_collected)
    
    if record_update.hiv_test is not None:
        update_fields.append("hiv_test = %s")
        update_values.append(record_update.hiv_test)
    
    if record_update.hepatitis_b_test is not None:
        update_fields.append("hepatitis_b_test = %s")
        update_values.append(record_update.hepatitis_b_test)
    
    if record_update.hepatitis_c_test is not None:
        update_fields.append("hepatitis_c_test = %s")
        update_values.append(record_update.hepatitis_c_test)
    
    if record_update.syphilis_test is not None:
        update_fields.append("syphilis_test = %s")
        update_values.append(record_update.syphilis_test)
    
    if record_update.status is not None:
        update_fields.append("status = %s")
        update_values.append(record_update.status.value)
    
    if record_update.notes is not None:
        update_fields.append("notes = %s")
        update_values.append(record_update.notes)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add record_id to the end for WHERE clause
    update_values.append(record_id)
    
    query = f"UPDATE donation_records SET {', '.join(update_fields)} WHERE id = %s"
    db.execute_update(query, tuple(update_values))
    
    # Get the updated record
    updated_record = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )[0]
    
    # Add test_results field
    updated_record['test_results'] = {
        'hiv': updated_record['hiv_test'],
        'hepatitis_b': updated_record['hepatitis_b_test'],
        'hepatitis_c': updated_record['hepatitis_c_test'],
        'syphilis': updated_record['syphilis_test']
    }
    
    return updated_record


@router.put("/{record_id}/test-results", response_model=DonationRecordSchema)
def update_test_results(
    record_id: str,
    hiv_test: bool,
    hepatitis_b_test: bool,
    hepatitis_c_test: bool,
    syphilis_test: bool,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update test results (admin only)"""
    records = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )
    
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found"
        )
    
    # Update status based on test results
    status = "approved" if all([hiv_test, hepatitis_b_test, hepatitis_c_test, syphilis_test]) else "rejected"
    
    db.execute_update(
        """UPDATE donation_records SET hiv_test = %s, hepatitis_b_test = %s, 
           hepatitis_c_test = %s, syphilis_test = %s, status = %s WHERE id = %s""",
        (hiv_test, hepatitis_b_test, hepatitis_c_test, syphilis_test, status, record_id)
    )
    
    # Get the updated record
    updated_record = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )[0]
    
    # Add test_results field
    updated_record['test_results'] = {
        'hiv': updated_record['hiv_test'],
        'hepatitis_b': updated_record['hepatitis_b_test'],
        'hepatitis_c': updated_record['hepatitis_c_test'],
        'syphilis': updated_record['syphilis_test']
    }
    
    return updated_record


@router.delete("/{record_id}")
def delete_donation_record(
    record_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete donation record (admin only)"""
    records = db.execute_query(
        "SELECT * FROM donation_records WHERE id = %s",
        (record_id,)
    )
    
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found"
        )
    
    db.execute_update(
        "DELETE FROM donation_records WHERE id = %s",
        (record_id,)
    )
    
    return {"message": "Donation record deleted successfully"}
