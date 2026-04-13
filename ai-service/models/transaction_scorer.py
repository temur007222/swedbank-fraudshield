"""
Transaction fraud scoring using the trained RandomForest model.

Loads the saved model and provides risk assessment for individual transactions.
"""

from pathlib import Path
from typing import Any

import joblib
import numpy as np

MODEL_DIR = Path(__file__).resolve().parent / "saved"

HIGH_RISK_COUNTRIES = {"NG", "UA", "RU", "CN", "BR", "PH", "ID", "VN", "GH", "KE"}
BALTIC_COUNTRIES = {"LV", "LT", "EE"}

FEATURE_NAMES = [
    "amount_eur",
    "hour_of_day",
    "is_international",
    "is_new_merchant",
    "velocity_last_1h",
    "velocity_last_24h",
    "days_since_last_txn",
    "amount_vs_avg_ratio",
    "country_risk",
]


class TransactionScorer:
    """Scores transactions for fraud probability using a trained RandomForest model."""

    def __init__(self) -> None:
        self.model = None
        self.features: list[str] = []
        self._loaded = False

    def load(self) -> None:
        model_path = MODEL_DIR / "transaction_rf_model.joblib"
        features_path = MODEL_DIR / "transaction_features.joblib"

        if not model_path.exists():
            raise FileNotFoundError(
                f"Transaction model not found at {model_path}. Run train.py first."
            )

        self.model = joblib.load(model_path)
        self.features = joblib.load(features_path)
        self._loaded = True

    def score(self, transaction: dict[str, Any]) -> dict[str, Any]:
        """
        Score a single transaction and return a risk assessment.

        Expected transaction keys:
            amount_eur, country, merchant, hour_of_day, is_international,
            is_new_merchant, velocity_last_1h, velocity_last_24h,
            days_since_last_txn, amount_vs_avg_ratio

        Returns dict with:
            risk_score, risk_level, contributing_factors,
            recommended_action, explanation
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        # Build feature vector
        country = transaction.get("country", "")
        country_risk = (
            2 if country in HIGH_RISK_COUNTRIES
            else (1 if country not in BALTIC_COUNTRIES else 0)
        )

        feature_values = {
            "amount_eur": float(transaction.get("amount_eur", 0)),
            "hour_of_day": int(transaction.get("hour_of_day", 12)),
            "is_international": int(bool(transaction.get("is_international", False))),
            "is_new_merchant": int(bool(transaction.get("is_new_merchant", False))),
            "velocity_last_1h": int(transaction.get("velocity_last_1h", 0)),
            "velocity_last_24h": int(transaction.get("velocity_last_24h", 0)),
            "days_since_last_txn": float(transaction.get("days_since_last_txn", 1.0)),
            "amount_vs_avg_ratio": float(transaction.get("amount_vs_avg_ratio", 1.0)),
            "country_risk": country_risk,
        }

        X = np.array([[feature_values[f] for f in self.features]])
        fraud_prob = float(self.model.predict_proba(X)[0][1])

        # Determine risk level
        risk_level = _classify_risk(fraud_prob)

        # Identify contributing factors
        contributing_factors = _identify_factors(transaction, feature_values, self.model, self.features)

        # Determine recommended action
        recommended_action = _recommend_action(risk_level, contributing_factors)

        # Build human-readable explanation
        explanation = _build_explanation(
            fraud_prob, risk_level, contributing_factors, transaction
        )

        return {
            "risk_score": round(fraud_prob, 4),
            "risk_level": risk_level,
            "contributing_factors": contributing_factors,
            "recommended_action": recommended_action,
            "explanation": explanation,
        }


def _classify_risk(score: float) -> str:
    if score < 0.3:
        return "LOW"
    elif score < 0.6:
        return "MEDIUM"
    elif score < 0.85:
        return "HIGH"
    else:
        return "CRITICAL"


def _identify_factors(
    transaction: dict,
    feature_values: dict,
    model: Any,
    feature_names: list[str],
) -> list[dict[str, Any]]:
    """Identify which features contribute most to the fraud score."""
    factors = []

    importances = dict(zip(feature_names, model.feature_importances_))

    # Amount anomaly
    ratio = feature_values["amount_vs_avg_ratio"]
    if ratio > 3.0:
        factors.append({
            "factor": "unusual_amount",
            "detail": f"Transaction amount is {ratio:.1f}x the customer average",
            "severity": "high" if ratio > 5 else "medium",
            "importance": importances.get("amount_vs_avg_ratio", 0),
        })

    # Country risk
    if feature_values["country_risk"] == 2:
        factors.append({
            "factor": "high_risk_country",
            "detail": f"Transaction from high-risk country: {transaction.get('country', 'unknown')}",
            "severity": "high",
            "importance": importances.get("country_risk", 0),
        })
    elif feature_values["country_risk"] == 1:
        factors.append({
            "factor": "international_transaction",
            "detail": f"International transaction from: {transaction.get('country', 'unknown')}",
            "severity": "low",
            "importance": importances.get("country_risk", 0),
        })

    # Velocity spike
    if feature_values["velocity_last_1h"] >= 4:
        factors.append({
            "factor": "velocity_spike",
            "detail": f"{feature_values['velocity_last_1h']} transactions in the last hour",
            "severity": "high" if feature_values["velocity_last_1h"] >= 7 else "medium",
            "importance": importances.get("velocity_last_1h", 0),
        })

    if feature_values["velocity_last_24h"] >= 10:
        factors.append({
            "factor": "high_daily_volume",
            "detail": f"{feature_values['velocity_last_24h']} transactions in the last 24 hours",
            "severity": "medium",
            "importance": importances.get("velocity_last_24h", 0),
        })

    # New merchant
    if feature_values["is_new_merchant"]:
        factors.append({
            "factor": "new_merchant",
            "detail": f"First transaction with merchant: {transaction.get('merchant', 'unknown')}",
            "severity": "low",
            "importance": importances.get("is_new_merchant", 0),
        })

    # Unusual hour
    hour = feature_values["hour_of_day"]
    if hour <= 5 or hour >= 23:
        factors.append({
            "factor": "unusual_hour",
            "detail": f"Transaction at {hour:02d}:00 (outside normal business hours)",
            "severity": "medium",
            "importance": importances.get("hour_of_day", 0),
        })

    # Rapid succession
    if feature_values["days_since_last_txn"] < 0.02:
        factors.append({
            "factor": "rapid_succession",
            "detail": "Transaction occurred very shortly after the previous one",
            "severity": "medium",
            "importance": importances.get("days_since_last_txn", 0),
        })

    # Sort by importance descending
    factors.sort(key=lambda f: f["importance"], reverse=True)
    return factors


def _recommend_action(risk_level: str, factors: list[dict]) -> str:
    if risk_level == "CRITICAL":
        return "BLOCK transaction immediately and notify fraud team. Contact customer for verification."
    elif risk_level == "HIGH":
        return "Hold transaction for manual review. Send verification SMS to customer."
    elif risk_level == "MEDIUM":
        return "Allow transaction but flag for monitoring. Request step-up authentication if possible."
    else:
        return "Allow transaction. No action required."


def _build_explanation(
    score: float,
    risk_level: str,
    factors: list[dict],
    transaction: dict,
) -> str:
    amount = transaction.get("amount_eur", 0)
    merchant = transaction.get("merchant", "unknown")
    country = transaction.get("country", "unknown")

    lines = [
        f"Transaction of {amount:.2f} EUR at '{merchant}' from {country} "
        f"received a {risk_level} risk score of {score:.2%}.",
    ]

    if factors:
        lines.append("Key risk indicators:")
        for f in factors[:4]:
            lines.append(f"  - {f['detail']}")

    if risk_level in ("HIGH", "CRITICAL"):
        lines.append(
            "This transaction exhibits patterns commonly associated with fraudulent activity "
            "and should be reviewed before processing."
        )
    elif risk_level == "MEDIUM":
        lines.append(
            "This transaction has some unusual characteristics but may be legitimate. "
            "Enhanced monitoring is recommended."
        )

    return " ".join(lines)
