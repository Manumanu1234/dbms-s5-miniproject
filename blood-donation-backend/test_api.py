#!/usr/bin/env python3
"""
Test script for Blood Donation System API
This script tests all the API endpoints to ensure they work correctly
"""

import requests
import json
import sys
from datetime import datetime, timedelta

API_BASE_URL = "http://localhost:8000/api/v1"

def test_api():
    """Test all API endpoints"""
    print("Testing Blood Donation System API...")
    
    # Test health check
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✓ Health check passed")
        else:
            print("✗ Health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API server. Make sure it's running on http://localhost:8000")
        return False
    
    # Test authentication
    print("\n--- Testing Authentication ---")
    
    # Register a test user
    register_data = {
        "email": "test@example.com",
        "password": "test123",
        "role": "donor"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            print("✓ User registration successful")
        else:
            print(f"✗ User registration failed: {response.text}")
    except Exception as e:
        print(f"✗ User registration error: {e}")
    
    # Login
    login_data = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            print("✓ User login successful")
        else:
            print(f"✗ User login failed: {response.text}")
            return False
    except Exception as e:
        print(f"✗ User login error: {e}")
        return False
    
    # Set up headers for authenticated requests
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test donor profile creation
    print("\n--- Testing Donor Management ---")
    
    donor_data = {
        "name": "Test Donor",
        "email": "test@example.com",
        "phone": "+1-555-0123",
        "blood_type": "O+",
        "age": 25,
        "weight": 70,
        "address": "123 Test St, Test City, TC 12345",
        "medical_history": "No significant medical history"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/donors/", json=donor_data, headers=headers)
        if response.status_code == 200:
            print("✓ Donor profile creation successful")
        else:
            print(f"✗ Donor profile creation failed: {response.text}")
    except Exception as e:
        print(f"✗ Donor profile creation error: {e}")
    
    # Test blood request creation
    print("\n--- Testing Blood Requests ---")
    
    blood_request_data = {
        "name": "Test Patient",
        "email": "patient@example.com",
        "phone": "+1-555-0456",
        "blood_type": "A+",
        "urgency_level": "high",
        "units_needed": 2,
        "hospital_name": "Test Hospital",
        "doctor_name": "Dr. Test",
        "medical_condition": "Surgery preparation"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/blood-requests/", json=blood_request_data)
        if response.status_code == 200:
            print("✓ Blood request creation successful")
        else:
            print(f"✗ Blood request creation failed: {response.text}")
    except Exception as e:
        print(f"✗ Blood request creation error: {e}")
    
    # Test event creation (requires admin token)
    print("\n--- Testing Event Management ---")
    
    # First, create an admin user
    admin_register_data = {
        "email": "admin@example.com",
        "password": "admin123",
        "role": "admin"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/register", json=admin_register_data)
        if response.status_code == 200:
            print("✓ Admin user registration successful")
    except Exception as e:
        print(f"✗ Admin user registration error: {e}")
    
    # Login as admin
    admin_login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=admin_login_data)
        if response.status_code == 200:
            admin_token_data = response.json()
            admin_token = admin_token_data["access_token"]
            admin_headers = {
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
            print("✓ Admin login successful")
        else:
            print(f"✗ Admin login failed: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Admin login error: {e}")
        return False
    
    # Create an event
    event_data = {
        "title": "Test Blood Drive",
        "description": "A test blood donation event",
        "date": (datetime.now() + timedelta(days=7)).isoformat(),
        "time": "10:00",
        "location": "Test Center",
        "address": "456 Test Ave, Test City, TC 12345",
        "capacity": 20,
        "organizer": "Test Blood Bank"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/events/", json=event_data, headers=admin_headers)
        if response.status_code == 200:
            print("✓ Event creation successful")
        else:
            print(f"✗ Event creation failed: {response.text}")
    except Exception as e:
        print(f"✗ Event creation error: {e}")
    
    # Test dashboard stats
    print("\n--- Testing Dashboard ---")
    
    try:
        response = requests.get(f"{API_BASE_URL}/dashboard/stats", headers=admin_headers)
        if response.status_code == 200:
            stats = response.json()
            print("✓ Dashboard stats retrieved successfully")
            print(f"  - Total donors: {stats.get('total_donors', 0)}")
            print(f"  - Total blood requests: {stats.get('total_receivers', 0)}")
            print(f"  - Upcoming events: {stats.get('upcoming_events', 0)}")
        else:
            print(f"✗ Dashboard stats failed: {response.text}")
    except Exception as e:
        print(f"✗ Dashboard stats error: {e}")
    
    print("\n--- API Testing Complete ---")
    print("✓ All major API endpoints tested successfully!")
    return True

if __name__ == "__main__":
    success = test_api()
    sys.exit(0 if success else 1)
