"""Pydantic schemas for LoginSession and detection endpoints."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SessionCreate(BaseModel):
    """Incoming login event to analyze."""
    monitored_account_id: int
    ip: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    login_hour: int
    device_type: Optional[str] = None


class SessionOut(BaseModel):
    id: int
    monitored_account_id: int
    ip: str
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    login_hour: int
    device_type: Optional[str]
    risk_score: float
    is_takeover: bool
    xai_reason: Optional[str]
    timestamp: datetime
    platform: Optional[str] = None
    username: Optional[str] = None

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    login_session_id: int
    risk_score: float
    message: str
    webhook_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_accounts: int
    total_sessions: int
    takeover_count: int
    alert_count: int
    avg_risk_score: float


class SearchResult(BaseModel):
    sessions: list[SessionOut]
    total: int
