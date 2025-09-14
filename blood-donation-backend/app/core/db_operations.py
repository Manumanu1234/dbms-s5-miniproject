from typing import Dict, List, Any, Optional, Union
from app.core.database import get_db
import uuid
from datetime import datetime


class DynamicDBOperations:
    """Dynamic database operations for all tables"""
    
    def __init__(self, db):
        self.db = db
        
    def create_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record in any table"""
        # Generate ID if not provided
        if 'id' not in data:
            data['id'] = str(uuid.uuid4())
            
        # Prepare columns and values
        columns = list(data.keys())
        placeholders = ', '.join(['%s'] * len(columns))
        column_names = ', '.join(columns)
        values = tuple(data.values())
        
        query = f"INSERT INTO {table} ({column_names}) VALUES ({placeholders})"
        self.db.execute_insert(query, values)
        
        # Return the created record
        return self.get_record_by_id(table, data['id'])
    
    def get_record_by_id(self, table: str, record_id: str) -> Optional[Dict[str, Any]]:
        """Get a single record by ID"""
        query = f"SELECT * FROM {table} WHERE id = %s"
        results = self.db.execute_query(query, (record_id,))
        return results[0] if results else None
    
    def get_records(self, table: str, filters: Dict[str, Any] = None, 
                   limit: int = 100, offset: int = 0, 
                   order_by: str = "created_at", order_dir: str = "DESC") -> List[Dict[str, Any]]:
        """Get multiple records with optional filtering"""
        query = f"SELECT * FROM {table}"
        params = []
        
        if filters:
            where_clauses = []
            for key, value in filters.items():
                if value is not None:
                    where_clauses.append(f"{key} = %s")
                    params.append(value)
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
        
        query += f" ORDER BY {order_by} {order_dir} LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        return self.db.execute_query(query, tuple(params))
    
    def update_record(self, table: str, record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a record by ID"""
        if not data:
            raise ValueError("No data provided for update")
            
        # Remove None values and id from update data
        update_data = {k: v for k, v in data.items() if v is not None and k != 'id'}
        
        if not update_data:
            raise ValueError("No valid fields to update")
        
        # Build update query
        set_clauses = []
        values = []
        
        for key, value in update_data.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)
        
        values.append(record_id)
        
        query = f"UPDATE {table} SET {', '.join(set_clauses)} WHERE id = %s"
        self.db.execute_update(query, tuple(values))
        
        # Return updated record
        return self.get_record_by_id(table, record_id)
    
    def delete_record(self, table: str, record_id: str) -> bool:
        """Delete a record by ID"""
        query = f"DELETE FROM {table} WHERE id = %s"
        affected_rows = self.db.execute_update(query, (record_id,))
        return affected_rows > 0
    
    def count_records(self, table: str, filters: Dict[str, Any] = None) -> int:
        """Count records in a table with optional filtering"""
        query = f"SELECT COUNT(*) as count FROM {table}"
        params = []
        
        if filters:
            where_clauses = []
            for key, value in filters.items():
                if value is not None:
                    where_clauses.append(f"{key} = %s")
                    params.append(value)
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
        
        result = self.db.execute_query(query, tuple(params))
        return result[0]['count'] if result else 0
    
    def record_exists(self, table: str, filters: Dict[str, Any]) -> bool:
        """Check if a record exists with given filters"""
        return self.count_records(table, filters) > 0
    
    def get_records_by_field(self, table: str, field: str, value: Any) -> List[Dict[str, Any]]:
        """Get records by a specific field value"""
        query = f"SELECT * FROM {table} WHERE {field} = %s"
        return self.db.execute_query(query, (value,))
    
    def update_record_by_field(self, table: str, field: str, field_value: Any, 
                              data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Update records by a specific field value"""
        if not data:
            raise ValueError("No data provided for update")
            
        # Remove None values
        update_data = {k: v for k, v in data.items() if v is not None}
        
        if not update_data:
            raise ValueError("No valid fields to update")
        
        # Build update query
        set_clauses = []
        values = []
        
        for key, value in update_data.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)
        
        values.append(field_value)
        
        query = f"UPDATE {table} SET {', '.join(set_clauses)} WHERE {field} = %s"
        self.db.execute_update(query, tuple(values))
        
        # Return updated records
        return self.get_records_by_field(table, field, field_value)
    
    def execute_custom_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a custom SELECT query"""
        return self.db.execute_query(query, params)
    
    def execute_custom_update(self, query: str, params: tuple = None) -> int:
        """Execute a custom UPDATE/DELETE query"""
        return self.db.execute_update(query, params)


# Global instance
def get_db_ops():
    """Get database operations instance"""
    db = get_db()
    return DynamicDBOperations(db)


# Table-specific helper classes
class UserOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "users"
    
    def create_user(self, email: str, password: str, role: str) -> Dict[str, Any]:
        return self.db_ops.create_record(self.table, {
            "email": email,
            "password": password,
            "role": role
        })
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        results = self.db_ops.get_records_by_field(self.table, "email", email)
        return results[0] if results else None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.db_ops.get_record_by_id(self.table, user_id)


class DonorOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "donors"
    
    def create_donor(self, user_id: str, donor_data: Dict[str, Any]) -> Dict[str, Any]:
        donor_data["user_id"] = user_id
        return self.db_ops.create_record(self.table, donor_data)
    
    def get_donor_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        results = self.db_ops.get_records_by_field(self.table, "user_id", user_id)
        return results[0] if results else None
    
    def get_all_donors(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, limit=limit, offset=offset)
    
    def update_donor_eligibility(self, donor_id: str, is_eligible: bool) -> Dict[str, Any]:
        return self.db_ops.update_record(self.table, donor_id, {"is_eligible": is_eligible})
    
    def get_eligible_donors(self) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, filters={"is_eligible": True})
    
    def get_ineligible_donors(self) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, filters={"is_eligible": False})


class ReceiverOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "blood_receivers"
    
    def create_receiver(self, user_id: str, receiver_data: Dict[str, Any]) -> Dict[str, Any]:
        receiver_data["user_id"] = user_id
        return self.db_ops.create_record(self.table, receiver_data)
    
    def get_receiver_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        results = self.db_ops.get_records_by_field(self.table, "user_id", user_id)
        return results[0] if results else None
    
    def get_all_receivers(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, limit=limit, offset=offset)


class BloodRequestOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "blood_requests"
    
    def create_request(self, receiver_id: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        request_data["receiver_id"] = receiver_id
        return self.db_ops.create_record(self.table, request_data)
    
    def get_requests_by_receiver(self, receiver_id: str) -> List[Dict[str, Any]]:
        return self.db_ops.get_records_by_field(self.table, "receiver_id", receiver_id)
    
    def get_all_requests(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, limit=limit, offset=offset)
    
    def update_request_status(self, request_id: str, status: str) -> Dict[str, Any]:
        return self.db_ops.update_record(self.table, request_id, {"status": status})


class DonationEventOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "donation_events"
    
    def create_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        return self.db_ops.create_record(self.table, event_data)
    
    def get_all_events(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, limit=limit, offset=offset)
    
    def get_upcoming_events(self) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, filters={"status": "upcoming"})


class DonationRecordOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "donation_records"
    
    def create_record(self, record_data: Dict[str, Any]) -> Dict[str, Any]:
        return self.db_ops.create_record(self.table, record_data)
    
    def get_records_by_donor(self, donor_id: str) -> List[Dict[str, Any]]:
        return self.db_ops.get_records_by_field(self.table, "donor_id", donor_id)
    
    def get_all_records(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, limit=limit, offset=offset)


class BloodInventoryOperations:
    def __init__(self, db_ops: DynamicDBOperations):
        self.db_ops = db_ops
        self.table = "blood_inventory"
    
    def get_all_inventory(self) -> List[Dict[str, Any]]:
        return self.db_ops.get_records(self.table, order_by="blood_type", order_dir="ASC")
    
    def update_inventory(self, blood_type: str, units_available: int, expiry_date: str) -> Dict[str, Any]:
        # Check if inventory record exists
        existing = self.db_ops.get_records_by_field(self.table, "blood_type", blood_type)
        
        if existing:
            # Update existing record
            return self.db_ops.update_record(self.table, existing[0]['id'], {
                "units_available": units_available,
                "expiry_date": expiry_date,
                "last_updated": datetime.now()
            })
        else:
            # Create new record
            return self.db_ops.create_record(self.table, {
                "blood_type": blood_type,
                "units_available": units_available,
                "expiry_date": expiry_date
            })
