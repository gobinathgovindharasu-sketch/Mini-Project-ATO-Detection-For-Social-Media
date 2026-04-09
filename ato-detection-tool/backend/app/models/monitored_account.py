"""
MonitoredAccount — social media accounts added by users.
Passwords are Fernet-encrypted before storage.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class MonitoredAccount(Base):
    __tablename__ = "monitored_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # twitter, instagram, etc.
    username = Column(String(255), nullable=False)
    encrypted_password = Column(String(512), nullable=False)  # Fernet cipher text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="monitored_accounts")
    login_sessions = relationship(
        "LoginSession", back_populates="monitored_account", cascade="all, delete-orphan"
    )
