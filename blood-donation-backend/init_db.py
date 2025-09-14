#!/usr/bin/env python3
"""
Database initialization script for Blood Donation System
This script creates the database tables and populates them with sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db, db
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import uuid
import json


def create_sample_data():
    """Create sample data for the database"""
    try:
        # Create admin user
        admin_user_id = str(uuid.uuid4())
        db.execute_insert(
            "INSERT INTO users (id, email, password, role) VALUES (%s, %s, %s, %s)",
            (admin_user_id, "admin@bloodbank.com", get_password_hash("admin123"), "admin")
        )
        
        # Create donor user
        donor_user_id = str(uuid.uuid4())
        db.execute_insert(
            "INSERT INTO users (id, email, password, role) VALUES (%s, %s, %s, %s)",
            (donor_user_id, "john.doe@email.com", get_password_hash("donor123"), "donor")
        )
        
        # Create donor profile
        donor_profile_id = str(uuid.uuid4())
        db.execute_insert(
            """INSERT INTO donors (id, user_id, name, email, phone, blood_type, age, weight, 
               address, medical_history, last_donation_date, is_eligible) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (donor_profile_id, donor_user_id, "John Doe", "john.doe@email.com", "+1-555-0123",
             "O+", 28, 70, "123 Main St, City, State 12345", "No significant medical history",
             datetime.utcnow() - timedelta(days=30), True)
        )
        
        # Create blood receiver
        blood_receiver_id = str(uuid.uuid4())
        db.execute_insert(
            """INSERT INTO blood_receivers (id, name, email, phone, blood_type, urgency_level, 
               units_needed, hospital_name, doctor_name, medical_condition, status) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (blood_receiver_id, "Jane Smith", "jane.smith@email.com", "+1-555-0456", "A+",
             "high", 3, "City General Hospital", "Dr. Wilson", "Surgery preparation", "pending")
        )
        
        # Create donation event
        donation_event_id = str(uuid.uuid4())
        db.execute_insert(
            """INSERT INTO donation_events (id, title, description, date, time, location, 
               address, capacity, registered_donors, organizer, status) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (donation_event_id, "Community Blood Drive", 
             "Join us for our monthly community blood drive to help save lives in our community.",
             datetime.utcnow() + timedelta(days=7), "09:00", "Community Center",
             "456 Community Ave, City, State 12345", 50, json.dumps([donor_profile_id]),
             "City Blood Bank", "upcoming")
        )
        
        # Create blood inventory
        blood_types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        units_available = [25, 15, 20, 10, 8, 5, 30, 18]
        
        for blood_type, units in zip(blood_types, units_available):
            inventory_id = str(uuid.uuid4())
            db.execute_insert(
                "INSERT INTO blood_inventory (id, blood_type, units_available, expiry_date) VALUES (%s, %s, %s, %s)",
                (inventory_id, blood_type, units, datetime.utcnow() + timedelta(days=30))
            )
        
        # Create donation record
        donation_record_id = str(uuid.uuid4())
        db.execute_insert(
            """INSERT INTO donation_records (id, donor_id, event_id, donation_date, blood_type, 
               units_collected, hiv_test, hepatitis_b_test, hepatitis_c_test, syphilis_test, 
               status, notes) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (donation_record_id, donor_profile_id, donation_event_id,
             datetime.utcnow() - timedelta(days=30), "O+", 1, True, True, True, True,
             "approved", "Successful donation")
        )
        
        print("Sample data created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        raise e


def main():
    """Main function to initialize database"""
    print("Initializing Blood Donation System Database...")
    
    try:
        # Initialize database tables
        init_db()
        print("Database tables created successfully!")
        
        # Create sample data
        create_sample_data()
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Database initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
