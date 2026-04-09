"""
Alerts router — list and manage alerts.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alert import Alert
from app.schemas.session import AlertOut

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertOut])
def get_alerts(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List recent alerts."""
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()
    return alerts


@router.get("/all", response_model=list[AlertOut])
def get_all_alerts(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """Public endpoint for demo — list alerts without auth."""
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()
    return alerts
