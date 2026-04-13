"""
Voice (phone call) vishing detector.

Rule-based analysis of call metadata to detect vishing (voice phishing) patterns.
No ML model is required -- scoring is based on weighted behavioral indicators.
"""

from typing import Any


# Weights for individual vishing signals (0-1 contribution each)
SIGNAL_WEIGHTS = {
    "caller_asked_for_credentials": 0.25,
    "caller_created_urgency": 0.15,
    "caller_threatened_account_closure": 0.15,
    "caller_requested_remote_access": 0.20,
    "caller_asked_for_otp": 0.20,
    "caller_id_spoofed": 0.15,
    "multiple_calls_same_day": 0.10,
}

SUSPICIOUS_REASONS = {
    "account_verification_urgent",
    "security_breach_notification",
    "tax_refund_processing",
    "prize_claim",
    "debt_collection_threat",
    "police_impersonation",
    "bank_fraud_department",
    "tech_support_scam",
}


class VoiceDetector:
    """Detects vishing patterns from phone call metadata."""

    def analyze(self, call: dict[str, Any]) -> dict[str, Any]:
        """
        Analyze a phone call record for vishing indicators.

        Expected keys:
            caller_number, direction, reason, duration_seconds, hour_of_day,
            caller_asked_for_credentials, caller_created_urgency,
            caller_threatened_account_closure, caller_requested_remote_access,
            caller_asked_for_otp, multiple_calls_same_day, caller_id_spoofed

        Returns:
            vishing_probability, anomaly_flags, risk_level,
            recommended_action, explanation
        """
        anomaly_flags: list[dict[str, Any]] = []
        raw_score = 0.0

        # Check boolean signals
        for signal, weight in SIGNAL_WEIGHTS.items():
            if call.get(signal, False):
                raw_score += weight
                anomaly_flags.append({
                    "flag": signal,
                    "description": _flag_description(signal),
                    "weight": weight,
                })

        # Reason-based scoring
        reason = call.get("reason", "")
        if reason in SUSPICIOUS_REASONS:
            reason_boost = 0.15
            raw_score += reason_boost
            anomaly_flags.append({
                "flag": "suspicious_call_reason",
                "description": f"Call reason '{reason}' is a known vishing pretext",
                "weight": reason_boost,
            })

        # Duration anomaly: vishing calls tend to be longer (>5 min)
        duration = call.get("duration_seconds", 0)
        if duration > 600:
            dur_boost = 0.08
            raw_score += dur_boost
            anomaly_flags.append({
                "flag": "extended_call_duration",
                "description": f"Call lasted {duration // 60} minutes ({duration}s), unusually long",
                "weight": dur_boost,
            })

        # Inbound-only (vishing is almost always inbound)
        direction = call.get("direction", "inbound")
        if direction == "inbound":
            raw_score += 0.02
        else:
            # Outbound calls are very unlikely to be vishing
            raw_score *= 0.3

        # Unknown or foreign caller number
        caller_number = call.get("caller_number", "")
        if caller_number == "Unknown":
            num_boost = 0.10
            raw_score += num_boost
            anomaly_flags.append({
                "flag": "unknown_caller_id",
                "description": "Caller number is withheld/unknown",
                "weight": num_boost,
            })
        elif not caller_number.startswith("+371"):
            num_boost = 0.05
            raw_score += num_boost
            anomaly_flags.append({
                "flag": "foreign_caller_number",
                "description": f"Call from foreign number: {caller_number}",
                "weight": num_boost,
            })

        # Clamp to 0-1
        vishing_prob = min(1.0, max(0.0, raw_score))

        # Risk level
        if vishing_prob < 0.3:
            risk_level = "LOW"
        elif vishing_prob < 0.6:
            risk_level = "MEDIUM"
        elif vishing_prob < 0.85:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        recommended_action = _recommend_action(risk_level, anomaly_flags)
        explanation = _build_explanation(call, vishing_prob, risk_level, anomaly_flags)

        return {
            "vishing_probability": round(vishing_prob, 4),
            "anomaly_flags": anomaly_flags,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
            "explanation": explanation,
        }


def _flag_description(signal: str) -> str:
    descriptions = {
        "caller_asked_for_credentials": "Caller requested login credentials or PIN",
        "caller_created_urgency": "Caller used urgency or pressure tactics",
        "caller_threatened_account_closure": "Caller threatened to close or freeze the account",
        "caller_requested_remote_access": "Caller asked for remote access to the device",
        "caller_asked_for_otp": "Caller requested a one-time password or SMS code",
        "caller_id_spoofed": "Caller ID appears to be spoofed",
        "multiple_calls_same_day": "Multiple calls from same source in one day",
    }
    return descriptions.get(signal, signal.replace("_", " ").capitalize())


def _recommend_action(risk_level: str, flags: list[dict]) -> str:
    if risk_level == "CRITICAL":
        return (
            "IMMEDIATE ACTION: Terminate the call. Freeze any pending transactions. "
            "Contact the customer via verified channel to confirm account security. "
            "File a fraud report."
        )
    elif risk_level == "HIGH":
        return (
            "Alert the customer that this call exhibits vishing characteristics. "
            "Recommend they hang up and call the bank directly using the number "
            "on their card. Flag the number for investigation."
        )
    elif risk_level == "MEDIUM":
        return (
            "Monitor the call. Advise the customer to never share credentials "
            "or OTP codes over the phone. Log the incident for pattern analysis."
        )
    else:
        return "No action required. Call appears normal."


def _build_explanation(
    call: dict,
    probability: float,
    risk_level: str,
    flags: list[dict],
) -> str:
    caller = call.get("caller_number", "unknown")
    reason = call.get("reason", "unknown")
    duration = call.get("duration_seconds", 0)

    lines = [
        f"Phone call from {caller} (reason: {reason}, duration: {duration}s) "
        f"received a {risk_level} vishing risk score of {probability:.0%}.",
    ]

    if flags:
        lines.append("Detected anomalies:")
        for f in flags[:6]:
            lines.append(f"  - {f['description']}")

    if risk_level in ("HIGH", "CRITICAL"):
        lines.append(
            "This call exhibits multiple characteristics of a vishing attack. "
            "Legitimate banks will NEVER ask for passwords, PINs, or OTP codes over the phone."
        )

    return " ".join(lines)
