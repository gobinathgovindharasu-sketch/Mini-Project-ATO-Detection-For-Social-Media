"""Initial tables

Revision ID: 001
Revises: None
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="user"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "monitored_accounts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("platform", sa.String(50), nullable=False),
        sa.Column("username", sa.String(255), nullable=False),
        sa.Column("encrypted_password", sa.String(512), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "login_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("monitored_account_id", sa.Integer(), sa.ForeignKey("monitored_accounts.id"), nullable=False),
        sa.Column("ip", sa.String(45), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("login_hour", sa.Integer(), nullable=False),
        sa.Column("device_type", sa.String(100), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("is_takeover", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("xai_reason", sa.String(512), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("login_session_id", sa.Integer(), sa.ForeignKey("login_sessions.id"), nullable=False, unique=True),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("message", sa.String(512), nullable=False),
        sa.Column("webhook_sent", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("login_sessions")
    op.drop_table("monitored_accounts")
    op.drop_table("users")
