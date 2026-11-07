import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'medicare-super-secret-production-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'medicare-jwt-secret-key-medical-app-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get('JWT_ACCESS_HOURS', 12)))

    basedir = os.path.abspath(os.path.dirname(__file__))
    sqlite_path = os.path.join(basedir, '..', 'medicare.db')
    
    raw_db_url = os.environ.get('DATABASE_URL', '').strip()
    
    # If explicitly configured to use SQLite or if no DATABASE_URL given
    if not raw_db_url or raw_db_url.startswith('sqlite'):
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}" if not raw_db_url else raw_db_url
    else:
        # PostgreSQL URL format normalization
        if raw_db_url.startswith("postgres://"):
            raw_db_url = raw_db_url.replace("postgres://", "postgresql+pg8000://", 1)
        elif raw_db_url.startswith("postgresql://"):
            raw_db_url = raw_db_url.replace("postgresql://", "postgresql+pg8000://", 1)
        elif raw_db_url.startswith("postgresql+psycopg://"):
            raw_db_url = raw_db_url.replace("postgresql+psycopg://", "postgresql+pg8000://", 1)
        
        # Test if PostgreSQL is reachable when fallback is enabled
        use_fallback = os.environ.get('USE_SQLITE_FALLBACK', 'true').lower() in ('true', '1', 'yes')
        if use_fallback:
            try:
                from sqlalchemy import create_engine
                engine = create_engine(raw_db_url, connect_args={"connect_timeout": 2})
                with engine.connect():
                    pass
                SQLALCHEMY_DATABASE_URI = raw_db_url
            except Exception:
                # PostgreSQL not running locally; fallback cleanly to persistent SQLite
                SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}"
        else:
            SQLALCHEMY_DATABASE_URI = raw_db_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}
