from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.db_operations import get_db_ops, UserOperations
from app.core.security import verify_token
from app.schemas.user import TokenData

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    user_id = verify_token(token)
    if user_id is None:
        raise credentials_exception
    
    db_ops = get_db_ops()
    user_ops = UserOperations(db_ops)
    user = user_ops.get_user_by_id(user_id)
    
    if not user:
        raise credentials_exception
    
    return user


def get_current_admin_user(
    current_user = Depends(get_current_user)
):
    if current_user['role'] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def get_current_donor_user(
    current_user = Depends(get_current_user)
):
    if current_user['role'] != "donor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def get_current_receiver_user(
    current_user = Depends(get_current_user)
):
    if current_user['role'] != "receiver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
