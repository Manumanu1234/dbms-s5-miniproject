from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.api.deps import get_current_admin_user
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Get dashboard statistics (admin only)"""
    
    # Total donors
    total_donors_result = db.execute_query("SELECT COUNT(*) as count FROM donors")
    total_donors = total_donors_result[0]['count']
    
    # Total blood requests
    total_receivers_result = db.execute_query("SELECT COUNT(*) as count FROM blood_receivers")
    total_receivers = total_receivers_result[0]['count']
    
    # Upcoming events
    upcoming_events_result = db.execute_query(
        "SELECT COUNT(*) as count FROM donation_events WHERE status = 'upcoming'"
    )
    upcoming_events = upcoming_events_result[0]['count']
    
    # Total blood units available
    total_blood_units_result = db.execute_query(
        "SELECT SUM(units_available) as total FROM blood_inventory"
    )
    total_blood_units = total_blood_units_result[0]['total'] or 0
    
    # Critical requests (high urgency)
    critical_requests_result = db.execute_query(
        "SELECT COUNT(*) as count FROM blood_receivers WHERE urgency_level = 'critical'"
    )
    critical_requests = critical_requests_result[0]['count']
    
    # Recent donations (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_donations_result = db.execute_query(
        "SELECT COUNT(*) as count FROM donation_records WHERE donation_date >= %s",
        (thirty_days_ago,)
    )
    recent_donations = recent_donations_result[0]['count']
    
    # Blood type distribution
    blood_type_distribution = db.execute_query(
        "SELECT blood_type, SUM(units_available) as total_units FROM blood_inventory GROUP BY blood_type"
    )
    
    # Event status distribution
    event_status_distribution = db.execute_query(
        "SELECT status, COUNT(*) as count FROM donation_events GROUP BY status"
    )
    
    # Request status distribution
    request_status_distribution = db.execute_query(
        "SELECT status, COUNT(*) as count FROM blood_receivers GROUP BY status"
    )
    
    return {
        "total_donors": total_donors,
        "total_receivers": total_receivers,
        "upcoming_events": upcoming_events,
        "total_blood_units": int(total_blood_units),
        "critical_requests": critical_requests,
        "recent_donations": recent_donations,
        "blood_type_distribution": [
            {"blood_type": item['blood_type'], "units": int(item['total_units'])}
            for item in blood_type_distribution
        ],
        "event_status_distribution": [
            {"status": item['status'], "count": item['count']}
            for item in event_status_distribution
        ],
        "request_status_distribution": [
            {"status": item['status'], "count": item['count']}
            for item in request_status_distribution
        ]
    }
