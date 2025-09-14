from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database Configuration
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "blood_donation_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = "your_mysql_password_here"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your_super_secret_jwt_key_here_change_this_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # FastAPI Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Blood Donation System API"
    VERSION: str = "1.0.0"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def database_config(self) -> dict:
        return {
            "host": self.DB_HOST,
            "port": self.DB_PORT,
            "user": self.DB_USER,
            "password": self.DB_PASSWORD,
            "database": self.DB_NAME
        }
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
