from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    TAVILY_API_KEY: str = os.getenv('TAVILY_API_KEY', '')
    
    # Database
    DB_HOST: str = os.getenv('DB_HOST', 'localhost')
    DB_USER: str = os.getenv('DB_USER', 'root')
    DB_PASSWORD: str = os.getenv('DB_PASSWORD', '')
    DB_NAME: str = os.getenv('DB_NAME', 'hostly_db')
    DB_PORT: int = int(os.getenv('DB_PORT', 3306))
    
    # Server
    HOST: str = os.getenv('HOST', '0.0.0.0')
    PORT: int = int(os.getenv('PORT', 8000))
    DEBUG: bool = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # CORS
    FRONTEND_URL: str = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    BACKEND_URL: str = os.getenv('BACKEND_URL', 'http://localhost:3000')
    
    # Agent
    AGENT_MODEL: str = os.getenv('AGENT_MODEL', 'gpt-4')
    AGENT_TEMPERATURE: float = float(os.getenv('AGENT_TEMPERATURE', 0.7))
    MAX_SEARCH_RESULTS: int = int(os.getenv('MAX_SEARCH_RESULTS', 5))
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [self.FRONTEND_URL, self.BACKEND_URL]
    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+mysqlconnector://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        case_sensitive = True

settings = Settings()
