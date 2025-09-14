# Blood Donation System Backend API

A comprehensive FastAPI backend for the Blood Donation System, providing APIs for donor management, blood inventory tracking, event management, and blood request handling.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Donor Management**: Complete donor profile management and eligibility tracking
- **Blood Inventory**: Real-time blood inventory tracking with expiry management
- **Event Management**: Blood donation event creation and donor registration
- **Blood Requests**: Hospital blood request management and tracking
- **Donation Records**: Complete donation history and test result tracking
- **Dashboard**: Comprehensive statistics and analytics

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **MySQL**: Database
- **JWT**: JSON Web Tokens for authentication
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server

## Prerequisites

- Python 3.13+
- MySQL 8.0+
- pip or poetry for dependency management

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blood-donation-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env_template.txt .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=blood_donation_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   JWT_SECRET_KEY=your_super_secret_jwt_key_here
   ```

5. **Create MySQL database**
   ```sql
   CREATE DATABASE blood_donation_db;
   ```

6. **Initialize database**
   ```bash
   python init_db.py
   ```

## Running the Application

1. **Start the development server**
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc
   - Health check: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user info

### Donors
- `GET /api/v1/donors/` - Get all donors (admin)
- `GET /api/v1/donors/me` - Get my donor profile
- `POST /api/v1/donors/` - Create donor profile
- `PUT /api/v1/donors/me` - Update my donor profile
- `PUT /api/v1/donors/{donor_id}/eligibility` - Update donor eligibility (admin)

### Blood Inventory
- `GET /api/v1/blood-inventory/` - Get blood inventory (admin)
- `POST /api/v1/blood-inventory/` - Create inventory item (admin)
- `PUT /api/v1/blood-inventory/{inventory_id}` - Update inventory item (admin)
- `PUT /api/v1/blood-inventory/{inventory_id}/units` - Update blood units (admin)

### Blood Requests
- `GET /api/v1/blood-requests/` - Get all blood requests (admin)
- `POST /api/v1/blood-requests/` - Create blood request (public)
- `PUT /api/v1/blood-requests/{request_id}` - Update blood request (admin)
- `PUT /api/v1/blood-requests/{request_id}/status` - Update request status (admin)

### Events
- `GET /api/v1/events/` - Get all events (public)
- `POST /api/v1/events/` - Create event (admin)
- `GET /api/v1/events/{event_id}` - Get specific event (public)
- `POST /api/v1/events/{event_id}/register` - Register for event
- `DELETE /api/v1/events/{event_id}/unregister` - Unregister from event

### Donation Records
- `GET /api/v1/donation-records/` - Get all donation records (admin)
- `GET /api/v1/donation-records/my-records` - Get my donation records
- `POST /api/v1/donation-records/` - Create donation record (admin)
- `PUT /api/v1/donation-records/{record_id}/test-results` - Update test results (admin)

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics (admin)

## Sample Data

The database initialization script creates sample data including:
- Admin user: `admin@bloodbank.com` / `admin123`
- Donor user: `john.doe@email.com` / `donor123`
- Sample blood inventory
- Sample blood request
- Sample donation event
- Sample donation record

## Development

### Project Structure
```
blood-donation-backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── donors.py
│   │   │   ├── blood_inventory.py
│   │   │   ├── blood_requests.py
│   │   │   ├── events.py
│   │   │   ├── donation_records.py
│   │   │   ├── dashboard.py
│   │   │   └── api.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── donor.py
│   │   ├── blood_receiver.py
│   │   ├── donation_event.py
│   │   ├── donation_record.py
│   │   └── blood_inventory.py
│   └── schemas/
│       ├── user.py
│       ├── donor.py
│       ├── blood_receiver.py
│       ├── donation_event.py
│       ├── donation_record.py
│       └── blood_inventory.py
├── main.py
├── init_db.py
├── requirements.txt
└── README.md
```

### Database Models

The system uses the following main models:
- **User**: Authentication and user management
- **Donor**: Donor profile information
- **BloodReceiver**: Blood request information
- **DonationEvent**: Blood donation events
- **DonationRecord**: Individual donation records
- **BloodInventory**: Blood inventory tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
