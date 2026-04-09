"""
PDF Report Service — generates downloadable PDF reports for sessions and alerts.
Uses reportlab for PDF generation (lightweight, no system dependencies).
"""

import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from sqlalchemy.orm import Session

from app.models.login_session import LoginSession
from app.models.alert import Alert


def generate_sessions_pdf(db: Session, account_id: int | None = None) -> bytes:
    """Generate a PDF report of login sessions."""
    query = db.query(LoginSession).order_by(LoginSession.timestamp.desc())
    if account_id:
        query = query.filter(LoginSession.monitored_account_id == account_id)
    sessions = query.limit(200).all()

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=0.5 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Title"],
        textColor=colors.HexColor("#00e5ff"), fontSize=18,
    )

    elements = []
    elements.append(Paragraph("ATO Detection — Login Sessions Report", title_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        styles["Normal"],
    ))
    elements.append(Spacer(1, 20))

    # Table
    data = [["ID", "Account", "IP", "Location", "Hour", "Device", "Risk", "Takeover", "Reason"]]
    for s in sessions:
        data.append([
            str(s.id),
            str(s.monitored_account_id),
            s.ip,
            s.location or "—",
            str(s.login_hour),
            s.device_type or "—",
            f"{s.risk_score:.2f}",
            "YES" if s.is_takeover else "No",
            (s.xai_reason or "")[:40],
        ])

    if len(data) > 1:
        t = Table(data, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#00e5ff")),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0a0a0a"), colors.HexColor("#111111")]),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        elements.append(t)
    else:
        elements.append(Paragraph("No sessions found.", styles["Normal"]))

    doc.build(elements)
    return buf.getvalue()


def generate_alerts_pdf(db: Session) -> bytes:
    """Generate a PDF report of alerts."""
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(200).all()

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=0.5 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Title"],
        textColor=colors.HexColor("#ff1744"), fontSize=18,
    )

    elements = []
    elements.append(Paragraph("ATO Detection — Alerts Report", title_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        styles["Normal"],
    ))
    elements.append(Spacer(1, 20))

    data = [["ID", "Session", "Risk Score", "Message", "Webhook", "Time"]]
    for a in alerts:
        data.append([
            str(a.id),
            str(a.login_session_id),
            f"{a.risk_score:.2f}",
            (a.message or "")[:50],
            "Sent" if a.webhook_sent else "Pending",
            a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else "—",
        ])

    if len(data) > 1:
        t = Table(data, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#ff1744")),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0a0a0a"), colors.HexColor("#111111")]),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        elements.append(t)
    else:
        elements.append(Paragraph("No alerts found.", styles["Normal"]))

    doc.build(elements)
    return buf.getvalue()
