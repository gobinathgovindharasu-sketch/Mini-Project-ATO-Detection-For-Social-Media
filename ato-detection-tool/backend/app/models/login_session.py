"""
LoginSession — each detected login attempt on a monitored account.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class LoginSession(Base):
    __tablename__ = "login_sessions"

    id = Column(Integer, primary_key=True, index=True)
    monitored_account_id = Column(
        Integer, ForeignKey("monitored_accounts.id"), nullable=False
    )
    ip = Column(String(45), nullable=False)
    location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    login_hour = Column(Integer, nullable=False)  # 0–23
    device_type = Column(String(100), nullable=True)
    risk_score = Column(Float, nullable=False, default=0.0)
    is_takeover = Column(Boolean, nullable=False, default=False)
    xai_reason = Column(String(512), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    monitored_account = relationship("MonitoredAccount", back_populates="login_sessions")
    alert = relationship("Alert", back_populates="login_session", uselist=False)
