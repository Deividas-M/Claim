import pyodbc
from fastapi import FastAPI, HTTPException

from Db.connection import get_connection

app = FastAPI(title="Claims API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/db-check")
def db_check() -> dict[str, str]:
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        cur.close()
        conn.close()
        return {"database": "connected"}
    except pyodbc.Error as exc:
        raise HTTPException(status_code=500, detail=f"DB connection failed: {exc}") from exc
