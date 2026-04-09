"""
Credential Service — manages social media account CRUD with Fernet encryption.
"""

from sqlalchemy.orm import Session

from app.core.encryption import encrypt_password
from app.models.monitored_account import MonitoredAccount
from app.schemas.account import AccountCreate


def add_monitored_account(
    db: Session, user_id: int, payload: AccountCreate
) -> MonitoredAccount:
    """Encrypt the password and persist the monitored account."""
    encrypted_pw = encrypt_password(payload.password)
    account = MonitoredAccount(
        user_id=user_id,
        platform=payload.platform.lower(),
        username=payload.username,
        encrypted_password=encrypted_pw,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def list_accounts(db: Session, user_id: int) -> list[MonitoredAccount]:
    return (
        db.query(MonitoredAccount)
        .filter(MonitoredAccount.user_id == user_id)
        .order_by(MonitoredAccount.created_at.desc())
        .all()
    )


def delete_account(db: Session, account_id: int, user_id: int) -> bool:
    account = (
        db.query(MonitoredAccount)
        .filter(MonitoredAccount.id == account_id, MonitoredAccount.user_id == user_id)
        .first()
    )
    if account:
        db.delete(account)
        db.commit()
        return True
    return False
