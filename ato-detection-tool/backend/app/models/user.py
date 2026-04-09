"""
User model — tool login accounts (admin / regular user).
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")  # "admin" | "user"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    monitored_accounts = relationship(
        "MonitoredAccount", back_populates="owner", cascade="all, delete-orphan"
    )
