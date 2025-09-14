from fastapi import APIRouter, Depends, HTTPException, status
from app.core.db_operations import get_db_ops, UserOperations
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import UserCreate, UserLogin, Token, User as UserSchema
from app.api.deps import get_current_user
from datetime import timedelta
from app.core.config import settings
import uuid

router = APIRouter()


@router.post("/register", response_model=UserSchema)
def register(user_data: UserCreate):
    try:
        db_ops = get_db_ops()
        user_ops = UserOperations(db_ops)
        
        # Check if user already exists
        existing_user = user_ops.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        return user_ops.create_user(user_data.email, hashed_password, user_data.role.value)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin):
    db_ops = get_db_ops()
    user_ops = UserOperations(db_ops)
    
    # Authenticate user
    user = user_ops.get_user_by_email(user_credentials.email)
    
    if not user or not verify_password(user_credentials.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user['id'], expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user = Depends(get_current_user)):
    return current_user
