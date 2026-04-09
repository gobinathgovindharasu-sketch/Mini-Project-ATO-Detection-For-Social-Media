"""
MonitoredAccount router — add, list, delete social media accounts.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.account import AccountCreate, AccountOut
from app.services.credential_service import (
    add_monitored_account,
    list_accounts,
    delete_account,
)

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.post("/", response_model=AccountOut, status_code=201)
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a social media account to monitor. Password is Fernet-encrypted."""
    account = add_monitored_account(db, current_user.id, payload)
    return account


@router.get("/", response_model=list[AccountOut])
def get_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_accounts(db, current_user.id)


@router.delete("/{account_id}")
def remove_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = delete_account(db, account_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"detail": "Account deleted"}
