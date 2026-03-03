from sqlalchemy import create_engine
from sqlalchemy.engine import URL

from app.core.config import settings


connection_url = URL.create(
    "mssql+pyodbc",
    username=settings.sqlserver_user,
    password=settings.sqlserver_password,
    host=settings.sqlserver_host,
    port=settings.sqlserver_port,
    database=settings.sqlserver_database,
    query={
        "driver": settings.sqlserver_driver,
        "TrustServerCertificate": "yes" if settings.sqlserver_trust_cert else "no",
    },
)

engine = create_engine(connection_url, pool_pre_ping=True, future=True)
