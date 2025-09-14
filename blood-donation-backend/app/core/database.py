import pymysql
from app.core.config import settings
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List

class Database:
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Create database connection"""
        try:
            self.connection = pymysql.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
            return self.connection
        except Exception as e:
            print(f"Database connection failed: {e}")
            raise e
    
    def get_connection(self):
        """Get database connection"""
        if not self.connection or not self.connection.open:
            self.connect()
        return self.connection
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            connection = self.get_connection()
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            print(f"Query execution failed: {e}")
            raise e
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute INSERT/UPDATE/DELETE query and return affected rows"""
        try:
            connection = self.get_connection()
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                connection.commit()
                return cursor.rowcount
        except Exception as e:
            print(f"Update execution failed: {e}")
            connection.rollback()
            raise e
    
    def execute_insert(self, query: str, params: tuple = None) -> int:
        """Execute INSERT query and return last insert ID"""
        try:
            connection = self.get_connection()
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                connection.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"Insert execution failed: {e}")
            connection.rollback()
            raise e
    
    def close(self):
        """Close database connection"""
        if self.connection and self.connection.open:
            self.connection.close()

# Global database instance
db = Database()

def get_db():
    """Dependency to get database instance"""
    return db

def init_db():
    """Initialize database tables"""
    try:
        # Test database connection
        connection = db.get_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("Database connection successful!")
        
        # Create all tables
        create_tables()
        print("Database tables created successfully!")
        
    except Exception as e:
        print(f"Database initialization failed: {e}")
        raise e

def create_tables():
    """Create all database tables"""
    connection = db.get_connection()
    
    # Users table
    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'donor', 'recv') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    """
    
    # Donors table
    donors_table = """
    CREATE TABLE IF NOT EXISTS donors (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        age INT NOT NULL,
        weight INT NOT NULL,
        address TEXT NOT NULL,
        medical_history TEXT,
        donation_units INT DEFAULT 1,
        last_donation_date TIMESTAMP NULL,
        is_eligible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    
    # Blood receivers table (unified table for receiver profiles and requests)
    blood_receivers_table = """
    CREATE TABLE IF NOT EXISTS blood_receivers (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        address TEXT NOT NULL,
        emergency_contact VARCHAR(255),
        medical_conditions TEXT,
        urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        units_needed INT DEFAULT 1,
        hospital_name VARCHAR(255),
        doctor_name VARCHAR(255),
        medical_condition TEXT,
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    
    # Donation events table
    donation_events_table = """
    CREATE TABLE IF NOT EXISTS donation_events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        time VARCHAR(10) NOT NULL,
        location VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        capacity INT NOT NULL,
        registered_donors JSON,
        organizer VARCHAR(255) NOT NULL,
        status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    """
    
    # Donation records table
    donation_records_table = """
    CREATE TABLE IF NOT EXISTS donation_records (
        id VARCHAR(36) PRIMARY KEY,
        donor_id VARCHAR(36) NOT NULL,
        event_id VARCHAR(36) NULL,
        donation_date TIMESTAMP NOT NULL,
        blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
        units_collected INT NOT NULL,
        hiv_test BOOLEAN DEFAULT FALSE,
        hepatitis_b_test BOOLEAN DEFAULT FALSE,
        hepatitis_c_test BOOLEAN DEFAULT FALSE,
        syphilis_test BOOLEAN DEFAULT FALSE,
        status ENUM('collected', 'tested', 'approved', 'rejected') DEFAULT 'collected',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES donation_events(id) ON DELETE SET NULL
    )
    """
    
    # Blood inventory table
    blood_inventory_table = """
    CREATE TABLE IF NOT EXISTS blood_inventory (
        id VARCHAR(36) PRIMARY KEY,
        blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') UNIQUE NOT NULL,
        units_available INT NOT NULL DEFAULT 0,
        expiry_date TIMESTAMP NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    """
    
    tables = [
        users_table,
        donors_table,
        blood_receivers_table,
        donation_events_table,
        donation_records_table,
        blood_inventory_table
    ]
    
    with connection.cursor() as cursor:
        for table in tables:
            cursor.execute(table)
    
    connection.commit()
