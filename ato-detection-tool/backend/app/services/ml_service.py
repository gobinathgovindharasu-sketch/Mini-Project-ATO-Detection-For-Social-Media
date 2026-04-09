"""
ML Service — Ensemble of Isolation Forest + One-Class SVM for anomaly detection.
Provides risk scoring and explainable AI reasons for each login session.
"""

import os
import numpy as np
import joblib
from typing import Tuple

from app.core.config import get_settings

settings = get_settings()

# Feature order: login_hour, device_type_encoded, latitude, longitude,
#                ip_numeric_hash, hour_sin, hour_cos


DEVICE_MAP = {
    "desktop": 0, "mobile": 1, "tablet": 2, "unknown": 3,
    "bot": 4, "smart_tv": 5, "gaming_console": 6,
}


def _encode_device(device_type: str | None) -> int:
    if device_type is None:
        return 3
    return DEVICE_MAP.get(device_type.lower(), 3)


def _ip_hash(ip: str) -> float:
    """Deterministic numeric hash of an IP address, normalized 0-1."""
    parts = ip.split(".")
    if len(parts) == 4:
        try:
            return sum(int(p) * (256 ** (3 - i)) for i, p in enumerate(parts)) / (256**4)
        except ValueError:
            pass
    return abs(hash(ip)) / (2**61)


def _build_features(
    login_hour: int,
    device_type: str | None,
    latitude: float | None,
    longitude: float | None,
    ip: str,
) -> np.ndarray:
    """Build a feature vector from raw session data."""
    hour_sin = np.sin(2 * np.pi * login_hour / 24)
    hour_cos = np.cos(2 * np.pi * login_hour / 24)
    lat = latitude or 0.0
    lon = longitude or 0.0
    return np.array([
        login_hour,
        _encode_device(device_type),
        lat,
        lon,
        _ip_hash(ip),
        hour_sin,
        hour_cos,
    ]).reshape(1, -1)


def _explain(
    login_hour: int,
    device_type: str | None,
    latitude: float | None,
    longitude: float | None,
    risk_score: float,
) -> str:
    """Generate an explainable AI reason for the risk score."""
    reasons = []

    # Unusual login hour (late night / early morning)
    if login_hour < 5 or login_hour > 23:
        reasons.append("Unusual Login Hour (late night/early morning)")

    # Unknown or suspicious device
    if device_type and device_type.lower() in ("bot", "unknown", "gaming_console", "smart_tv"):
        reasons.append(f"Unusual Device ({device_type})")

    # Impossible travel — extreme lat/lon values or unusual coordinates
    if latitude is not None and longitude is not None:
        if abs(latitude) > 60 or abs(longitude) > 140:
            reasons.append("Impossible Travel Detected (extreme coordinates)")

    if risk_score > 0.9:
        reasons.append("Extremely High Anomaly Score")
    elif risk_score > 0.8:
        reasons.append("High Anomaly Score")

    if not reasons:
        if risk_score > 0.5:
            reasons.append("Moderate Behavioral Deviation")
        else:
            reasons.append("Normal Behavior")

    return "; ".join(reasons)


class MLService:
    """Singleton-style ML service that loads ensemble model from disk."""

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        model_path = settings.MODEL_PATH
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            # Model not trained yet — fallback to heuristic scoring
            self.model = None

    def predict(
        self,
        login_hour: int,
        device_type: str | None,
        latitude: float | None,
        longitude: float | None,
        ip: str,
    ) -> Tuple[float, bool, str]:
        """
        Returns (risk_score, is_takeover, xai_reason).
        """
        features = _build_features(login_hour, device_type, latitude, longitude, ip)

        if self.model is not None:
            try:
                # Ensemble returns dict with iso_forest and ocsvm scores
                iso_score = self.model["iso_forest"].decision_function(features)[0]
                svm_score = self.model["ocsvm"].decision_function(features)[0]

                # Normalize: decision_function returns negative for outliers
                # Convert to 0-1 risk score (higher = more anomalous)
                iso_risk = max(0.0, min(1.0, 0.5 - iso_score))
                svm_risk = max(0.0, min(1.0, 0.5 - svm_score))

                # Ensemble average
                risk_score = round(0.6 * iso_risk + 0.4 * svm_risk, 4)
            except Exception:
                risk_score = self._heuristic_score(login_hour, device_type, latitude, longitude)
        else:
            risk_score = self._heuristic_score(login_hour, device_type, latitude, longitude)

        is_takeover = risk_score >= settings.RISK_THRESHOLD
        xai_reason = _explain(login_hour, device_type, latitude, longitude, risk_score)

        return risk_score, is_takeover, xai_reason

    @staticmethod
    def _heuristic_score(
        login_hour: int,
        device_type: str | None,
        latitude: float | None,
        longitude: float | None,
    ) -> float:
        """Fallback heuristic when no model is loaded."""
        score = 0.0
        if login_hour < 5 or login_hour > 23:
            score += 0.35
        if device_type and device_type.lower() in ("bot", "unknown", "gaming_console"):
            score += 0.3
        if latitude is not None and (abs(latitude) > 60):
            score += 0.2
        if longitude is not None and (abs(longitude) > 140):
            score += 0.15
        return round(min(score, 1.0), 4)

    def reload_model(self):
        """Re-load model from disk (e.g., after retraining)."""
        self._load_model()


# Module-level singleton
ml_service = MLService()
