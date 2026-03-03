from sqlalchemy import text
from sqlalchemy.orm import Session

from app.repositories.sql_names import SqlNames


class LookupRepository:
    def __init__(self, db: Session):
        self.db = db

    def users(self) -> list[dict]:
        q = text(f"SELECT id, name FROM {SqlNames.users_view} ORDER BY name")
        return [dict(r._mapping) for r in self.db.execute(q)]

    def claim_types(self) -> list[dict]:
        q = text(f"SELECT id, name FROM {SqlNames.claim_types_view} ORDER BY name")
        return [dict(r._mapping) for r in self.db.execute(q)]

    def statuses(self) -> list[dict]:
        q = text(f"SELECT id, name FROM {SqlNames.statuses_view} ORDER BY name")
        return [dict(r._mapping) for r in self.db.execute(q)]

    def priorities(self) -> list[dict]:
        q = text(f"SELECT id, name FROM {SqlNames.priorities_view} ORDER BY name")
        return [dict(r._mapping) for r in self.db.execute(q)]

    def order_hierarchy(self, order_id: str | None, order_line_id: str | None) -> list[dict]:
        where = []
        params: dict[str, str] = {}
        if order_id:
            where.append("order_id = :order_id")
            params["order_id"] = order_id
        if order_line_id:
            where.append("order_line_id = :order_line_id")
            params["order_line_id"] = order_line_id
        clause = f"WHERE {' AND '.join(where)}" if where else ""
        q = text(
            f"""
            SELECT order_id, order_line_id, component_id
            FROM {SqlNames.order_hierarchy_view}
            {clause}
            ORDER BY order_id, order_line_id, component_id
            """
        )
        return [dict(r._mapping) for r in self.db.execute(q, params)]
