# JANASHAKTI AI Microservice (Module 8)
FastAPI service for incident classification and duplicate detection.

## Pilot City
Davanagere, Karnataka, India

## Execution
```bash
python -m venv .venv
source .venv/bin/activate # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

## Policy
- **No Official Verification by AI**: `is_official_verification` is strictly forced to `False`. Verification requires authorized human municipal personnel.

