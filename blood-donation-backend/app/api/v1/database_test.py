from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.core.db_operations import (
    get_db_ops, 
    UserOperations, 
    DonorOperations, 
    ReceiverOperations,
    BloodRequestOperations,
    DonationEventOperations,
    DonationRecordOperations,
    BloodInventoryOperations
)
from app.api.deps import get_current_admin_user
from datetime import datetime

router = APIRouter()


@router.get("/test-all-tables")
def test_all_table_operations(current_user = Depends(get_current_admin_user)):
    """Test dynamic operations on all tables (admin only)"""
    db_ops = get_db_ops()
    results = {}
    
    try:
        # Test Users table
        user_ops = UserOperations(db_ops)
        test_user_data = {
            "email": f"test_{datetime.now().timestamp()}@example.com",
            "password": "hashed_password",
            "role": "donor"
        }
        created_user = db_ops.create_record("users", test_user_data)
        results["users"] = {
            "create": "success",
            "user_id": created_user["id"],
            "read": db_ops.get_record_by_id("users", created_user["id"]) is not None
        }
        
        # Test Donors table
        donor_ops = DonorOperations(db_ops)
        test_donor_data = {
            "user_id": created_user["id"],
            "name": "Test Donor",
            "email": test_user_data["email"],
            "phone": "1234567890",
            "blood_type": "O+",
            "age": 25,
            "weight": 70,
            "address": "Test Address",
            "medical_history": "None"
        }
        created_donor = donor_ops.create_donor(created_user["id"], test_donor_data)
        results["donors"] = {
            "create": "success",
            "donor_id": created_donor["id"],
            "read": donor_ops.get_donor_by_user_id(created_user["id"]) is not None,
            "update": donor_ops.update_donor_eligibility(created_donor["id"], False) is not None
        }
        
        # Test Blood Receivers table
        receiver_ops = ReceiverOperations(db_ops)
        test_receiver_data = {
            "user_id": created_user["id"],
            "name": "Test Receiver",
            "email": test_user_data["email"],
            "phone": "1234567890",
            "blood_type": "A+",
            "address": "Test Address",
            "emergency_contact": "Emergency Contact",
            "medical_conditions": "None"
        }
        created_receiver = receiver_ops.create_receiver(created_user["id"], test_receiver_data)
        results["blood_receivers"] = {
            "create": "success",
            "receiver_id": created_receiver["id"],
            "read": receiver_ops.get_receiver_by_user_id(created_user["id"]) is not None
        }
        
        # Test Blood Requests table
        request_ops = BloodRequestOperations(db_ops)
        test_request_data = {
            "receiver_id": created_receiver["id"],
            "blood_type": "A+",
            "urgency_level": "medium",
            "units_needed": 2,
            "hospital_name": "Test Hospital",
            "doctor_name": "Dr. Test",
            "medical_condition": "Test condition",
            "notes": "Test notes"
        }
        created_request = request_ops.create_request(created_receiver["id"], test_request_data)
        results["blood_requests"] = {
            "create": "success",
            "request_id": created_request["id"],
            "read": len(request_ops.get_requests_by_receiver(created_receiver["id"])) > 0,
            "update": request_ops.update_request_status(created_request["id"], "fulfilled") is not None
        }
        
        # Test Donation Events table
        event_ops = DonationEventOperations(db_ops)
        test_event_data = {
            "title": "Test Blood Drive",
            "description": "Test description",
            "date": datetime.now(),
            "time": "10:00 AM",
            "location": "Test Location",
            "address": "Test Address",
            "capacity": 50,
            "registered_donors": "[]",
            "organizer": "Test Organizer",
            "status": "upcoming"
        }
        created_event = event_ops.create_event(test_event_data)
        results["donation_events"] = {
            "create": "success",
            "event_id": created_event["id"],
            "read": db_ops.get_record_by_id("donation_events", created_event["id"]) is not None
        }
        
        # Test Donation Records table
        record_ops = DonationRecordOperations(db_ops)
        test_record_data = {
            "donor_id": created_donor["id"],
            "event_id": created_event["id"],
            "donation_date": datetime.now(),
            "blood_type": "O+",
            "units_collected": 1,
            "hiv_test": True,
            "hepatitis_b_test": True,
            "hepatitis_c_test": True,
            "syphilis_test": True,
            "status": "collected",
            "notes": "Test donation"
        }
        created_record = record_ops.create_record(test_record_data)
        results["donation_records"] = {
            "create": "success",
            "record_id": created_record["id"],
            "read": len(record_ops.get_records_by_donor(created_donor["id"])) > 0
        }
        
        # Test Blood Inventory table
        inventory_ops = BloodInventoryOperations(db_ops)
        test_inventory_data = {
            "blood_type": "AB-",
            "units_available": 10,
            "expiry_date": "2024-12-31 23:59:59"
        }
        created_inventory = inventory_ops.update_inventory("AB-", 10, "2024-12-31 23:59:59")
        results["blood_inventory"] = {
            "create": "success",
            "inventory_id": created_inventory["id"],
            "read": len(inventory_ops.get_all_inventory()) > 0
        }
        
        # Clean up test data
        db_ops.delete_record("donation_records", created_record["id"])
        db_ops.delete_record("blood_requests", created_request["id"])
        db_ops.delete_record("donation_events", created_event["id"])
        db_ops.delete_record("blood_inventory", created_inventory["id"])
        db_ops.delete_record("blood_receivers", created_receiver["id"])
        db_ops.delete_record("donors", created_donor["id"])
        db_ops.delete_record("users", created_user["id"])
        
        results["cleanup"] = "success"
        results["overall_status"] = "All tables working dynamically!"
        
    except Exception as e:
        results["error"] = str(e)
        results["overall_status"] = "Some tables have issues"
    
    return results


@router.get("/table-counts")
def get_table_counts(current_user = Depends(get_current_admin_user)):
    """Get record counts for all tables (admin only)"""
    db_ops = get_db_ops()
    
    tables = [
        "users", "donors", "blood_receivers", "blood_requests",
        "donation_events", "donation_records", "blood_inventory"
    ]
    
    counts = {}
    for table in tables:
        try:
            counts[table] = db_ops.count_records(table)
        except Exception as e:
            counts[table] = f"Error: {str(e)}"
    
    return counts


@router.get("/table-structure/{table_name}")
def get_table_structure(table_name: str, current_user = Depends(get_current_admin_user)):
    """Get sample records from a table to see its structure (admin only)"""
    db_ops = get_db_ops()
    
    valid_tables = [
        "users", "donors", "blood_receivers", "blood_requests",
        "donation_events", "donation_records", "blood_inventory"
    ]
    
    if table_name not in valid_tables:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid table name. Valid tables: {valid_tables}"
        )
    
    try:
        # Get up to 3 sample records
        records = db_ops.get_records(table_name, limit=3)
        return {
            "table": table_name,
            "count": db_ops.count_records(table_name),
            "sample_records": records
        }
    except Exception as e:
        return {
            "table": table_name,
            "error": str(e)
        }


@router.post("/dynamic-query")
def execute_dynamic_query(
    query_data: Dict[str, Any],
    current_user = Depends(get_current_admin_user)
):
    """Execute a dynamic query on any table (admin only)"""
    db_ops = get_db_ops()
    
    table = query_data.get("table")
    operation = query_data.get("operation")  # create, read, update, delete
    data = query_data.get("data", {})
    filters = query_data.get("filters", {})
    record_id = query_data.get("record_id")
    
    valid_tables = [
        "users", "donors", "blood_receivers", "blood_requests",
        "donation_events", "donation_records", "blood_inventory"
    ]
    
    if table not in valid_tables:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid table name. Valid tables: {valid_tables}"
        )
    
    try:
        if operation == "create":
            result = db_ops.create_record(table, data)
        elif operation == "read":
            if record_id:
                result = db_ops.get_record_by_id(table, record_id)
            else:
                result = db_ops.get_records(table, filters=filters, limit=10)
        elif operation == "update":
            if not record_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="record_id is required for update operation"
                )
            result = db_ops.update_record(table, record_id, data)
        elif operation == "delete":
            if not record_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="record_id is required for delete operation"
                )
            result = db_ops.delete_record(table, record_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid operation. Valid operations: create, read, update, delete"
            )
        
        return {
            "table": table,
            "operation": operation,
            "result": result,
            "status": "success"
        }
    
    except Exception as e:
        return {
            "table": table,
            "operation": operation,
            "error": str(e),
            "status": "error"
        }
