from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    app_env: str = "dev"
    app_port: int = 8000
    cors_origins: str = "http://localhost:5173"

    sqlserver_host: str
    sqlserver_port: int = 1433
    sqlserver_database: str
    sqlserver_user: str
    sqlserver_password: str
    sqlserver_driver: str = "ODBC Driver 18 for SQL Server"
    sqlserver_trust_cert: bool = True

    db_schema: str = "dbo"
    db_users_view: str = "vw_users"
    db_claim_types_view: str = "vw_claim_types"
    db_statuses_view: str = "vw_claim_statuses"
    db_priorities_view: str = "vw_priorities"
    db_order_hierarchy_view: str = "vw_order_hierarchy"
    db_claims_table: str = "claims"
    db_claim_identifiers_table: str = "claim_identifiers"
    db_claim_stage2_table: str = "claim_stage2"
    db_attachments_table: str = "claim_attachments"

    email_provider: str = "stub"
    email_from: str = "no-reply@example.com"
    email_smtp_host: str = ""
    email_smtp_port: str = ""
    email_smtp_user: str = ""
    email_smtp_password: str = ""

    file_storage_provider: str = "local"
    file_storage_root: str = "backend/uploads"
    file_storage_max_mb: int = 25


settings = Settings()
