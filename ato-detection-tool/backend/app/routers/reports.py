"""
Reports router — generate and download PDF reports.
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.pdf_service import generate_sessions_pdf, generate_alerts_pdf

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/sessions")
def download_sessions_report(
    account_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Download a PDF report of login sessions."""
    pdf_bytes = generate_sessions_pdf(db, account_id)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=sessions_report.pdf"},
    )


@router.get("/alerts")
def download_alerts_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Download a PDF report of alerts."""
    pdf_bytes = generate_alerts_pdf(db)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=alerts_report.pdf"},
    )
