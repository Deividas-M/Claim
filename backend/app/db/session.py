from collections.abc import Iterator

from sqlalchemy.orm import Session

from app.db.database import engine


def get_db() -> Iterator[Session]:
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()
