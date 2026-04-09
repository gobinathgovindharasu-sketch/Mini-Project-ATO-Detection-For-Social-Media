"""
Alert — generated when a login session exceeds the risk threshold.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    login_session_id = Column(
        Integer, ForeignKey("login_sessions.id"), nullable=False, unique=True
    )
    risk_score = Column(Float, nullable=False)
    message = Column(String(512), nullable=False)
    webhook_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    login_session = relationship("LoginSession", back_populates="alert")
