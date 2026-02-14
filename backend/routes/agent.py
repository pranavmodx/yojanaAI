from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas
from routes.auth import get_current_user
from services.ai_service import ai_service

router = APIRouter(prefix="/agent", tags=["agent"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/run")
def run_agent(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI Agent analyzes user profile against all schemes.
    Returns eligibility results — does NOT auto-apply.
    User picks which schemes to apply to.
    """
    # Re-query user in this session
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.profile_completed:
        raise HTTPException(status_code=400, detail="Please complete your profile first")

    schemes = db.query(models.Scheme).all()

    # Get existing applications to avoid duplicate suggestions
    existing_apps = db.query(models.Application).filter(
        models.Application.user_id == user.id
    ).all()
    existing_scheme_ids = [app.scheme_id for app in existing_apps]

    results = ai_service.run_agent(user, schemes, existing_scheme_ids)
    return {
        "user_name": user.name,
        "total_schemes": len(schemes),
        "eligible_count": sum(1 for r in results if r["eligible"]),
        "already_applied_count": sum(1 for r in results if r["already_applied"]),
        "results": results,
    }


@router.post("/apply/{scheme_id}")
def agent_apply(
    scheme_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply to a specific scheme via the agent."""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    scheme = db.query(models.Scheme).filter(models.Scheme.id == scheme_id).first()

    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.user_id == user.id,
        models.Application.scheme_id == scheme_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this scheme")

    application = models.Application(
        user_id=user.id,
        scheme_id=scheme_id,
        status="Applied via AI Agent",
        submitted_documents={},
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": f"Successfully applied to {scheme.name}",
        "application_id": application.id,
        "documents_needed": scheme.documents_required or [],
    }
