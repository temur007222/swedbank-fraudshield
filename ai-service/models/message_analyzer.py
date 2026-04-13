"""
Message (SMS / email) fraud analyzer.

Combines the trained TF-IDF + LogisticRegression model with rule-based
pattern detection for urgency words, fake URLs, and impersonation attempts.
"""

import re
from pathlib import Path
from typing import Any

import joblib
import numpy as np

MODEL_DIR = Path(__file__).resolve().parent / "saved"


# ---------------------------------------------------------------------------
# Regex-based pattern rules
# ---------------------------------------------------------------------------

URGENCY_PATTERNS = [
    (re.compile(r"\b(urgent|immediately|right\s*now|asap|instant)\b", re.I), "urgency_language"),
    (re.compile(r"\b(act\s*within|expires?\s*in|limited\s*time|last\s*chance)\b", re.I), "time_pressure"),
    (re.compile(r"\b(permanently\s*locked|suspended|blocked|closed|disabled)\b", re.I), "threat_of_loss"),
    (re.compile(r"\b(verify\s*now|confirm\s*now|update\s*now|click\s*now)\b", re.I), "action_demand"),
    (re.compile(r"\b24\s*hours?\b", re.I), "deadline_pressure"),
]

FAKE_URL_PATTERNS = [
    (re.compile(r"https?://[a-z0-9\-]*swedbank[a-z0-9\-]*\.(xyz|tk|ml|ga|cf|top|buzz|click|info|biz)\b", re.I), "suspicious_domain_tld"),
    (re.compile(r"https?://(?!www\.swedbank\.(lv|lt|ee|se|com))[a-z0-9\-]*swedbank[a-z0-9\-]*\.[a-z]+", re.I), "fake_bank_domain"),
    (re.compile(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", re.I), "ip_address_url"),
    (re.compile(r"https?://[a-z0-9]+\.(xyz|tk|ml|ga|cf|top|buzz|click)\b", re.I), "free_tld_url"),
    (re.compile(r"bit\.ly|tinyurl|goo\.gl|t\.co|short\.link", re.I), "url_shortener"),
]

IMPERSONATION_PATTERNS = [
    (re.compile(r"\bSwedbank\s*(Security|Support|Team|Alert|Service)\b", re.I), "bank_department_impersonation"),
    (re.compile(r"\b(police|law\s*enforcement|government|tax\s*authority)\b", re.I), "authority_impersonation"),
    (re.compile(r"security@[a-z\-]*swedbank[a-z\-]*\.(xyz|tk|ml|ga|cf|top|buzz|click)", re.I), "fake_sender_address"),
    (re.compile(r"\bDear\s*Valued\s*Customer\b", re.I), "generic_greeting"),
    (re.compile(r"\b(won|congratulations|lottery|prize|reward)\b", re.I), "prize_scam_language"),
]


class MessageAnalyzer:
    """Analyzes SMS and email messages for fraud indicators."""

    def __init__(self) -> None:
        self.pipeline = None
        self._loaded = False

    def load(self) -> None:
        model_path = MODEL_DIR / "message_classifier_pipeline.joblib"
        if not model_path.exists():
            raise FileNotFoundError(
                f"Message classifier not found at {model_path}. Run train.py first."
            )
        self.pipeline = joblib.load(model_path)
        self._loaded = True

    def analyze(self, message: dict[str, Any]) -> dict[str, Any]:
        """
        Analyze a single message for fraud indicators.

        Expected keys:
            channel (sms|email), sender, subject (optional), body

        Returns:
            fraud_probability, detected_patterns, classification,
            risk_level, explanation
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        channel = message.get("channel", "sms")
        sender = message.get("sender", "")
        subject = message.get("subject", "") or ""
        body = message.get("body", "")

        full_text = f"{subject} {body}".strip()

        # ML model probability
        ml_prob = float(self.pipeline.predict_proba([full_text])[0][1])

        # Rule-based pattern detection
        detected_patterns = _detect_patterns(full_text, sender)

        # Combine ML score with rule signals
        rule_boost = _calculate_rule_boost(detected_patterns)
        combined_prob = min(1.0, ml_prob * 0.7 + rule_boost * 0.3)

        # Classification
        if combined_prob >= 0.7:
            classification = "fraudulent"
        elif combined_prob >= 0.4:
            classification = "suspicious"
        else:
            classification = "legitimate"

        # Risk level
        if combined_prob < 0.3:
            risk_level = "LOW"
        elif combined_prob < 0.6:
            risk_level = "MEDIUM"
        elif combined_prob < 0.85:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        explanation = _build_explanation(
            channel, classification, combined_prob, detected_patterns
        )

        return {
            "fraud_probability": round(combined_prob, 4),
            "ml_score": round(ml_prob, 4),
            "rule_score": round(rule_boost, 4),
            "detected_patterns": detected_patterns,
            "classification": classification,
            "risk_level": risk_level,
            "explanation": explanation,
        }


def _detect_patterns(text: str, sender: str) -> list[dict[str, str]]:
    """Run all regex rules against the message text and sender."""
    patterns_found: list[dict[str, str]] = []

    combined = f"{sender} {text}"

    for regex, label in URGENCY_PATTERNS:
        match = regex.search(combined)
        if match:
            patterns_found.append({
                "category": "urgency",
                "pattern": label,
                "matched_text": match.group(0),
            })

    for regex, label in FAKE_URL_PATTERNS:
        match = regex.search(combined)
        if match:
            patterns_found.append({
                "category": "fake_url",
                "pattern": label,
                "matched_text": match.group(0),
            })

    for regex, label in IMPERSONATION_PATTERNS:
        match = regex.search(combined)
        if match:
            patterns_found.append({
                "category": "impersonation",
                "pattern": label,
                "matched_text": match.group(0),
            })

    return patterns_found


def _calculate_rule_boost(patterns: list[dict]) -> float:
    """Calculate a 0-1 rule-based score from detected patterns."""
    if not patterns:
        return 0.0

    category_weights = {
        "fake_url": 0.40,
        "urgency": 0.20,
        "impersonation": 0.25,
    }

    score = 0.0
    categories_seen: set[str] = set()

    for p in patterns:
        cat = p["category"]
        if cat not in categories_seen:
            score += category_weights.get(cat, 0.1)
            categories_seen.add(cat)
        else:
            # Diminishing returns for same category
            score += category_weights.get(cat, 0.1) * 0.3

    return min(1.0, score)


def _build_explanation(
    channel: str,
    classification: str,
    probability: float,
    patterns: list[dict],
) -> str:
    channel_label = "SMS message" if channel == "sms" else "Email"

    if classification == "fraudulent":
        intro = (
            f"This {channel_label} has been classified as FRAUDULENT "
            f"with {probability:.0%} confidence."
        )
    elif classification == "suspicious":
        intro = (
            f"This {channel_label} has been flagged as SUSPICIOUS "
            f"with {probability:.0%} confidence."
        )
    else:
        intro = (
            f"This {channel_label} appears to be LEGITIMATE "
            f"with a fraud probability of {probability:.0%}."
        )

    lines = [intro]

    if patterns:
        lines.append("Detected indicators:")
        for p in patterns[:5]:
            lines.append(
                f"  - [{p['category'].upper()}] {p['pattern']}: \"{p['matched_text']}\""
            )

    if classification == "fraudulent":
        if any(p["category"] == "fake_url" for p in patterns):
            lines.append(
                "WARNING: The message contains a suspicious URL that does not belong to "
                "the official Swedbank domain. Do NOT click any links."
            )
        lines.append(
            "Recommended action: Block this message and alert the customer about "
            "the phishing attempt."
        )
    elif classification == "suspicious":
        lines.append(
            "Recommended action: Flag for manual review by the fraud analysis team."
        )

    return " ".join(lines)
