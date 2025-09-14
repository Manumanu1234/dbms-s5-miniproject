#!/usr/bin/env python3
"""
Test script to verify blood receivers data in database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db_operations import get_db_ops, ReceiverOperations

def test_receivers():
    try:
        print("Testing blood receivers data...")
        
        # Get database operations
        db_ops = get_db_ops()
        receiver_ops = ReceiverOperations(db_ops)
        
        # Fetch all receivers
        receivers = receiver_ops.get_all_receivers()
        
        print(f"Found {len(receivers)} receivers in database:")
        for i, receiver in enumerate(receivers, 1):
            print(f"\n--- Receiver {i} ---")
            for key, value in receiver.items():
                print(f"{key}: {value}")
        
        if not receivers:
            print("No receivers found in database!")
            
            # Check if table exists and has any data
            all_data = db_ops.execute_custom_query("SELECT COUNT(*) as count FROM blood_receivers")
            print(f"Total records in blood_receivers table: {all_data[0]['count'] if all_data else 0}")
            
            # Show table structure
            structure = db_ops.execute_custom_query("DESCRIBE blood_receivers")
            print("\nTable structure:")
            for col in structure:
                print(f"  {col}")
        
        return receivers
        
    except Exception as e:
        print(f"Error testing receivers: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    test_receivers()
