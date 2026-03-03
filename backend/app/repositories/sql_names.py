from app.core.config import settings


class SqlNames:
    schema = settings.db_schema
    users_view = f"{schema}.{settings.db_users_view}"
    claim_types_view = f"{schema}.{settings.db_claim_types_view}"
    statuses_view = f"{schema}.{settings.db_statuses_view}"
    priorities_view = f"{schema}.{settings.db_priorities_view}"
    order_hierarchy_view = f"{schema}.{settings.db_order_hierarchy_view}"
    claims_table = f"{schema}.{settings.db_claims_table}"
    identifiers_table = f"{schema}.{settings.db_claim_identifiers_table}"
    stage2_table = f"{schema}.{settings.db_claim_stage2_table}"
    attachments_table = f"{schema}.{settings.db_attachments_table}"
