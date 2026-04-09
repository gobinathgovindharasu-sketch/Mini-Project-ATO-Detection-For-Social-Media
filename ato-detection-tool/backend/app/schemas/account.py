"""Pydantic schemas for MonitoredAccount endpoints."""

from datetime import datetime
from pydantic import BaseModel


class AccountCreate(BaseModel):
    platform: str
    username: str
    password: str  # plain text from client; encrypted before storage


class AccountOut(BaseModel):
    id: int
    user_id: int
    platform: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
