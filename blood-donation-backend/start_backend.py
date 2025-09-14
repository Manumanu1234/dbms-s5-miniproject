#!/usr/bin/env python3
"""
Startup script for Blood Donation System Backend
This script installs dependencies, initializes the database, and starts the server
"""

import subprocess
import sys
import os
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed:")
        print(f"  Error: {e.stderr}")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting Blood Donation System Backend...")
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("✗ Please run this script from the blood-donation-backend directory")
        sys.exit(1)
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("✗ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("⚠️  .env file not found. Please create it from env_template.txt and update with your database credentials.")
        print("   Example:")
        print("   DB_PASSWORD=your_mysql_password_here")
        print("   JWT_SECRET_KEY=your_super_secret_jwt_key_here")
        sys.exit(1)
    
    # Initialize database
    if not run_command("python init_db.py", "Initializing database"):
        print("✗ Failed to initialize database. Please check your MySQL connection and credentials.")
        sys.exit(1)
    
    # Test API
    print("\n🧪 Testing API endpoints...")
    if not run_command("python test_api.py", "Testing API"):
        print("⚠️  API tests failed, but continuing with server startup...")
    
    # Start the server
    print("\n🌐 Starting FastAPI server...")
    print("   Server will be available at: http://localhost:8000")
    print("   API Documentation: http://localhost:8000/docs")
    print("   Press Ctrl+C to stop the server")
    print("\n" + "="*50)
    
    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n✗ Server startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
