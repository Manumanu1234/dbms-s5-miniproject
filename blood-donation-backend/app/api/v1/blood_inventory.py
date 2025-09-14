from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.database import get_db
from app.schemas.blood_inventory import BloodInventoryCreate, BloodInventoryUpdate, BloodInventory as BloodInventorySchema
from app.api.deps import get_current_admin_user
import uuid

router = APIRouter()


@router.get("/", response_model=List[BloodInventorySchema])
def get_blood_inventory(
    db = Depends(get_db)
):
    """Get blood inventory"""
    inventory = db.execute_query("SELECT * FROM blood_inventory ORDER BY blood_type")
    return inventory


@router.post("/", response_model=BloodInventorySchema)
def create_blood_inventory_item(
    inventory_data: BloodInventoryCreate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Create blood inventory item (admin only)"""
    # Check if blood type already exists
    existing_items = db.execute_query(
        "SELECT * FROM blood_inventory WHERE blood_type = %s",
        (inventory_data.blood_type.value,)
    )
    
    if existing_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blood type already exists in inventory"
        )
    
    inventory_id = str(uuid.uuid4())
    db.execute_insert(
        "INSERT INTO blood_inventory (id, blood_type, units_available, expiry_date) VALUES (%s, %s, %s, %s)",
        (inventory_id, inventory_data.blood_type.value, inventory_data.units_available, inventory_data.expiry_date)
    )
    
    # Get the created item
    created_item = db.execute_query(
        "SELECT * FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )[0]
    
    return created_item


@router.put("/{inventory_id}", response_model=BloodInventorySchema)
def update_blood_inventory_item(
    inventory_id: str,
    inventory_update: BloodInventoryUpdate,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update blood inventory item (admin only)"""
    inventory_items = db.execute_query(
        "SELECT * FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )
    
    if not inventory_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if inventory_update.units_available is not None:
        update_fields.append("units_available = %s")
        update_values.append(inventory_update.units_available)
    
    if inventory_update.expiry_date is not None:
        update_fields.append("expiry_date = %s")
        update_values.append(inventory_update.expiry_date)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add inventory_id to the end for WHERE clause
    update_values.append(inventory_id)
    
    query = f"UPDATE blood_inventory SET {', '.join(update_fields)} WHERE id = %s"
    db.execute_update(query, tuple(update_values))
    
    # Get the updated item
    updated_item = db.execute_query(
        "SELECT * FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )[0]
    
    return updated_item


@router.put("/{inventory_id}/units", response_model=BloodInventorySchema)
def update_blood_units(
    inventory_id: str,
    units_change: int,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Update blood units (admin only)"""
    inventory_items = db.execute_query(
        "SELECT * FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )
    
    if not inventory_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    current_units = inventory_items[0]['units_available']
    new_units = current_units + units_change
    
    if new_units < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot have negative units"
        )
    
    db.execute_update(
        "UPDATE blood_inventory SET units_available = %s WHERE id = %s",
        (new_units, inventory_id)
    )
    
    # Get the updated item
    updated_item = db.execute_query(
        "SELECT * FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )[0]
    
    return updated_item


@router.delete("/{inventory_id}")
def delete_blood_inventory_item(
    inventory_id: str,
    db = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    """Delete blood inventory item (admin only)"""
    inventory_items = db.execute_query(
        "SELECT * FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )
    
    if not inventory_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    db.execute_update(
        "DELETE FROM blood_inventory WHERE id = %s",
        (inventory_id,)
    )
    
    return {"message": "Inventory item deleted successfully"}
