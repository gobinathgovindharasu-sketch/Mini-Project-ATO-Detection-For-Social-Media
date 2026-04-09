"""
Alert Service — creates alerts and sends webhook notifications for high-risk sessions.
"""

import logging
import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.alert import Alert
from app.models.login_session import LoginSession

logger = logging.getLogger(__name__)
settings = get_settings()


def create_alert_if_needed(db: Session, session: LoginSession) -> Alert | None:
    """Create an alert if the session's risk score exceeds the threshold."""
    if session.risk_score < settings.RISK_THRESHOLD:
        return None

    message = (
        f"HIGH RISK (score={session.risk_score}) on account #{session.monitored_account_id}: "
        f"{session.xai_reason}"
    )

    alert = Alert(
        login_session_id=session.id,
        risk_score=session.risk_score,
        message=message,
        webhook_sent=False,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Fire webhook asynchronously (best effort)
    _send_webhook(alert)

    return alert


def _send_webhook(alert: Alert):
    """POST alert payload to configured webhook URL."""
    if not settings.WEBHOOK_URL:
        return
    try:
        payload = {
            "alert_id": alert.id,
            "risk_score": alert.risk_score,
            "message": alert.message,
            "created_at": str(alert.created_at),
        }
        with httpx.Client(timeout=5.0) as client:
            resp = client.post(settings.WEBHOOK_URL, json=payload)
            if resp.status_code < 300:
                # Mark as sent — we update outside the main transaction for simplicity
                alert.webhook_sent = True
                logger.info(f"Webhook sent for alert {alert.id}")
            else:
                logger.warning(f"Webhook returned {resp.status_code}")
    except Exception as e:
        logger.error(f"Webhook failed: {e}")


def list_alerts(db: Session, limit: int = 50) -> list[Alert]:
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()
