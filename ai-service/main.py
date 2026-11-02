"""
JANASHAKTI AI Microservice
Provides automated incident classification, urgency scoring, and triage hints.

CRITICAL POLICY:
Never label AI output as official verification.
All AI predictions are suggestions only and require human verification by an Authority officer.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import os

app = FastAPI(
    title="JANASHAKTI AI Incident Classifier",
    description="Pilot City Davanagere AI-Assisted Triage and Categorization Microservice",
    version="1.0.0",
)

class IncidentAnalysisRequest(BaseModel):
    title: str = Field(..., example="Deep pothole causing accidents near Hadadi bridge")
    description: str = Field(..., example="Road surface caved in. Vehicles are swerving sharply.")
    latitude: float = Field(..., example=14.4678)
    longitude: float = Field(..., example=75.9234)
    image_urls: Optional[List[str]] = Field(default=[], example=[])

class AIAnalysisResponse(BaseModel):
    suggested_category: str
    confidence_score: float
    urgency_level: str
    suggested_department: str
    is_official_verification: bool = False
    disclaimer: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JANASHAKTI AI Classifier",
        "pilot_city": "Davanagere, Karnataka",
        "official_verification_policy": "STRICT_HUMAN_ONLY",
    }

@app.post("/api/v1/classify", response_model=AIAnalysisResponse)
def classify_incident(request: IncidentAnalysisRequest):
    """
    Analyzes incident text and provides triage recommendation.
    NOTE: is_official_verification is ALWAYS False per civic compliance.
    """
    text = f"{request.title} {request.description}".lower()

    if any(k in text for k in ["pothole", "road", "asphalt", "crater", "bridge"]):
        category = "ROAD_HAZARD"
        dept = "MCC Road & Infrastructure Works"
        urgency = "HIGH"
        confidence = 0.92
    elif any(k in text for k in ["water", "leak", "pipeline", "drain", "sewage"]):
        category = "WATER_LEAKAGE"
        dept = "MCC Water Supply & Drainage"
        urgency = "MEDIUM"
        confidence = 0.88
    elif any(k in text for k in ["light", "dark", "lamp", "pole", "wire"]):
        category = "STREETLIGHT"
        dept = "BESCOM Electricity Division"
        urgency = "LOW"
        confidence = 0.94
    elif any(k in text for k in ["garbage", "trash", "waste", "dump", "smell"]):
        category = "GARBAGE_DUMP"
        dept = "MCC Solid Waste Management"
        urgency = "MEDIUM"
        confidence = 0.91
    else:
        category = "OTHER"
        dept = "General Municipal Desk"
        urgency = "MEDIUM"
        confidence = 0.65

    return AIAnalysisResponse(
        suggested_category=category,
        confidence_score=confidence,
        urgency_level=urgency,
        suggested_department=dept,
        is_official_verification=False,
        disclaimer="AI classification is advisory only. Official verification requires field validation by a designated Municipal or District Authority.",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

