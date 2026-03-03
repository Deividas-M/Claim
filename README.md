# Claim Registration Prototype

Minimal full-stack prototype with clean architecture:
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy + pyodbc
- Database: SQL Server (real connection from day 1)

## Run

### 1) Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend
```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## Notes
- Root `.env` is used by backend.
- Start with SQL object names in `.env` (`DB_*`). Map those to your real tables/views.
- No heavy migration setup yet; see `backend/migration_notes.md`.
