"""
Swedbank FraudShield AI - FastAPI microservice.

Endpoints:
    POST /api/score-transaction     - Score a transaction for fraud risk
    POST /api/analyze-communication - Analyze SMS/email for phishing
    POST /api/detect-voice-pattern  - Detect vishing from call metadata
    GET  /api/model-metrics         - Retrieve model performance metrics
    GET  /health                    - Health check
"""

import json
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models.message_analyzer import MessageAnalyzer
from models.transaction_scorer import TransactionScorer
from models.voice_detector import VoiceDetector

MODEL_DIR = Path(__file__).resolve().parent / "models" / "saved"

# ---------------------------------------------------------------------------
# Pydantic request / response schemas
# ---------------------------------------------------------------------------


class TransactionRequest(BaseModel):
    transaction_id: Optional[str] = None
    customer_id: Optional[str] = None
    amount_eur: float = Field(..., gt=0, description="Transaction amount in EUR")
    country: str = Field(..., description="ISO 2-letter country code")
    merchant: str = Field(..., description="Merchant name")
    hour_of_day: int = Field(..., ge=0, le=23)
    is_international: bool = False
    is_new_merchant: bool = False
    velocity_last_1h: int = Field(0, ge=0)
    velocity_last_24h: int = Field(0, ge=0)
    days_since_last_txn: float = Field(1.0, ge=0)
    amount_vs_avg_ratio: float = Field(1.0, ge=0)


class TransactionResponse(BaseModel):
    transaction_id: Optional[str] = None
    risk_score: float
    risk_level: str
    contributing_factors: list[dict[str, Any]]
    recommended_action: str
    explanation: str
    scored_at: str


class CommunicationRequest(BaseModel):
    communication_id: Optional[str] = None
    customer_id: Optional[str] = None
    channel: str = Field(..., description="sms or email")
    sender: str = ""
    subject: Optional[str] = None
    body: str = Field(..., min_length=1, description="Message body text")


class CommunicationResponse(BaseModel):
    communication_id: Optional[str] = None
    fraud_probability: float
    ml_score: float
    rule_score: float
    detected_patterns: list[dict[str, str]]
    classification: str
    risk_level: str
    explanation: str
    analyzed_at: str


class VoiceRequest(BaseModel):
    call_id: Optional[str] = None
    customer_id: Optional[str] = None
    caller_number: str = "Unknown"
    direction: str = "inbound"
    reason: str = "unknown"
    duration_seconds: int = Field(0, ge=0)
    hour_of_day: int = Field(12, ge=0, le=23)
    caller_asked_for_credentials: bool = False
    caller_created_urgency: bool = False
    caller_threatened_account_closure: bool = False
    caller_requested_remote_access: bool = False
    caller_asked_for_otp: bool = False
    multiple_calls_same_day: bool = False
    caller_id_spoofed: bool = False


class VoiceResponse(BaseModel):
    call_id: Optional[str] = None
    vishing_probability: float
    anomaly_flags: list[dict[str, Any]]
    risk_level: str
    recommended_action: str
    explanation: str
    analyzed_at: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    models_loaded: dict[str, bool]
    timestamp: str


# ---------------------------------------------------------------------------
# Application setup
# ---------------------------------------------------------------------------

transaction_scorer = TransactionScorer()
message_analyzer = MessageAnalyzer()
voice_detector = VoiceDetector()

models_status: dict[str, bool] = {
    "transaction_scorer": False,
    "message_analyzer": False,
    "voice_detector": True,  # Rule-based, always available
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models on startup."""
    try:
        transaction_scorer.load()
        models_status["transaction_scorer"] = True
        print("Transaction scorer model loaded.")
    except FileNotFoundError as e:
        print(f"WARNING: {e}")

    try:
        message_analyzer.load()
        models_status["message_analyzer"] = True
        print("Message analyzer model loaded.")
    except FileNotFoundError as e:
        print(f"WARNING: {e}")

    print("FraudShield AI service ready.")
    yield
    print("FraudShield AI service shutting down.")


app = FastAPI(
    title="Swedbank FraudShield AI",
    description="AI-powered fraud detection microservice for transaction scoring, "
                "phishing analysis, and vishing detection.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.post("/api/score-transaction", response_model=TransactionResponse)
async def score_transaction(request: TransactionRequest):
    """Score a transaction for fraud risk."""
    if not models_status["transaction_scorer"]:
        raise HTTPException(
            status_code=503,
            detail="Transaction scoring model is not loaded. Run train.py first.",
        )

    result = transaction_scorer.score(request.model_dump())

    return TransactionResponse(
        transaction_id=request.transaction_id,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        contributing_factors=result["contributing_factors"],
        recommended_action=result["recommended_action"],
        explanation=result["explanation"],
        scored_at=datetime.utcnow().isoformat(),
    )


@app.post("/api/analyze-communication", response_model=CommunicationResponse)
async def analyze_communication(request: CommunicationRequest):
    """Analyze an SMS or email message for phishing/smishing indicators."""
    if not models_status["message_analyzer"]:
        raise HTTPException(
            status_code=503,
            detail="Message analysis model is not loaded. Run train.py first.",
        )

    result = message_analyzer.analyze(request.model_dump())

    return CommunicationResponse(
        communication_id=request.communication_id,
        fraud_probability=result["fraud_probability"],
        ml_score=result["ml_score"],
        rule_score=result["rule_score"],
        detected_patterns=result["detected_patterns"],
        classification=result["classification"],
        risk_level=result["risk_level"],
        explanation=result["explanation"],
        analyzed_at=datetime.utcnow().isoformat(),
    )


@app.post("/api/detect-voice-pattern", response_model=VoiceResponse)
async def detect_voice_pattern(request: VoiceRequest):
    """Detect vishing patterns from phone call metadata."""
    result = voice_detector.analyze(request.model_dump())

    return VoiceResponse(
        call_id=request.call_id,
        vishing_probability=result["vishing_probability"],
        anomaly_flags=result["anomaly_flags"],
        risk_level=result["risk_level"],
        recommended_action=result["recommended_action"],
        explanation=result["explanation"],
        analyzed_at=datetime.utcnow().isoformat(),
    )


@app.get("/api/model-metrics")
async def get_model_metrics():
    """Return training metrics for all models."""
    metrics_path = MODEL_DIR / "metrics.json"

    if not metrics_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Metrics file not found. Run train.py first.",
        )

    with open(metrics_path) as f:
        metrics = json.load(f)

    return {
        "models_loaded": models_status,
        "metrics": metrics,
        "retrieved_at": datetime.utcnow().isoformat(),
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health check."""
    return HealthResponse(
        status="healthy",
        service="swedbank-fraudshield-ai",
        version="1.0.0",
        models_loaded=models_status,
        timestamp=datetime.utcnow().isoformat(),
    )


# ---------------------------------------------------------------------------
# Entrypoint for direct execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
