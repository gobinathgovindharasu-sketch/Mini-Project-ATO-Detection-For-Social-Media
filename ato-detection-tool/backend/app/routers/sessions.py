"""
Sessions router — submit login events for analysis, list sessions, dashboard stats.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.login_session import LoginSession
from app.models.monitored_account import MonitoredAccount
from app.models.alert import Alert
from app.schemas.session import SessionCreate, SessionOut, DashboardStats, SearchResult
from app.services.ml_service import ml_service
from app.services.alert_service import create_alert_if_needed

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/analyze", response_model=SessionOut, status_code=201)
def analyze_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a login event for ML analysis.
    Returns the session with risk score, classification, and XAI reason.
    """
    # Verify the account belongs to the user
    account = (
        db.query(MonitoredAccount)
        .filter(
            MonitoredAccount.id == payload.monitored_account_id,
            MonitoredAccount.user_id == current_user.id,
        )
        .first()
    )
    if not account:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Monitored account not found")

    # Run ML prediction
    risk_score, is_takeover, xai_reason = ml_service.predict(
        login_hour=payload.login_hour,
        device_type=payload.device_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        ip=payload.ip,
    )

    session = LoginSession(
        monitored_account_id=payload.monitored_account_id,
        ip=payload.ip,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        login_hour=payload.login_hour,
        device_type=payload.device_type,
        risk_score=risk_score,
        is_takeover=is_takeover,
        xai_reason=xai_reason,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Create alert if high-risk
    create_alert_if_needed(db, session)

    result = SessionOut.model_validate(session)
    result.platform = account.platform
    result.username = account.username
    return result


@router.get("/", response_model=list[SessionOut])
def list_sessions(
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recent sessions for accounts owned by the current user."""
    account_ids = [
        a.id
        for a in db.query(MonitoredAccount.id)
        .filter(MonitoredAccount.user_id == current_user.id)
        .all()
    ]
    sessions = (
        db.query(LoginSession)
        .filter(LoginSession.monitored_account_id.in_(account_ids))
        .order_by(LoginSession.timestamp.desc())
        .limit(limit)
        .all()
    )
    results = []
    for s in sessions:
        out = SessionOut.model_validate(s)
        if s.monitored_account:
            out.platform = s.monitored_account.platform
            out.username = s.monitored_account.username
        results.append(out)
    return results


@router.get("/all", response_model=list[SessionOut])
def list_all_sessions(
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
):
    """Public endpoint — list recent sessions (no auth required, for demo dashboard)."""
    sessions = (
        db.query(LoginSession)
        .order_by(LoginSession.timestamp.desc())
        .limit(limit)
        .all()
    )
    results = []
    for s in sessions:
        out = SessionOut.model_validate(s)
        if s.monitored_account:
            out.platform = s.monitored_account.platform
            out.username = s.monitored_account.username
        results.append(out)
    return results


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregated dashboard statistics."""
    account_ids = [
        a.id
        for a in db.query(MonitoredAccount.id)
        .filter(MonitoredAccount.user_id == current_user.id)
        .all()
    ]

    total_accounts = len(account_ids)
    total_sessions = (
        db.query(func.count(LoginSession.id))
        .filter(LoginSession.monitored_account_id.in_(account_ids))
        .scalar() or 0
    )
    takeover_count = (
        db.query(func.count(LoginSession.id))
        .filter(
            LoginSession.monitored_account_id.in_(account_ids),
            LoginSession.is_takeover == True,
        )
        .scalar() or 0
    )
    alert_count = (
        db.query(func.count(Alert.id))
        .join(LoginSession)
        .filter(LoginSession.monitored_account_id.in_(account_ids))
        .scalar() or 0
    )
    avg_risk = (
        db.query(func.avg(LoginSession.risk_score))
        .filter(LoginSession.monitored_account_id.in_(account_ids))
        .scalar() or 0.0
    )

    return DashboardStats(
        total_accounts=total_accounts,
        total_sessions=total_sessions,
        takeover_count=takeover_count,
        alert_count=alert_count,
        avg_risk_score=round(float(avg_risk), 4),
    )


@router.get("/search", response_model=SearchResult)
def search_sessions(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """
    Global search across sessions — matches IP, location, device, XAI reason.
    Also searches monitored account usernames.
    """
    pattern = f"%{q}%"

    # Find account IDs matching username
    matching_accounts = (
        db.query(MonitoredAccount.id)
        .filter(MonitoredAccount.username.ilike(pattern))
        .all()
    )
    matching_ids = [a.id for a in matching_accounts]

    query = db.query(LoginSession).filter(
        (LoginSession.ip.ilike(pattern))
        | (LoginSession.location.ilike(pattern))
        | (LoginSession.device_type.ilike(pattern))
        | (LoginSession.xai_reason.ilike(pattern))
        | (LoginSession.monitored_account_id.in_(matching_ids) if matching_ids else False)
    )

    total = query.count()
    sessions = query.order_by(LoginSession.timestamp.desc()).limit(limit).all()

    results = []
    for s in sessions:
        out = SessionOut.model_validate(s)
        if s.monitored_account:
            out.platform = s.monitored_account.platform
            out.username = s.monitored_account.username
        results.append(out)

    return SearchResult(sessions=results, total=total)
