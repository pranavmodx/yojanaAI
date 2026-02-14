from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas
import shutil
import os

router = APIRouter(
    prefix="/apply",
    tags=["apply"],
    responses={404: {"description": "Not found"}},
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.Application)
def apply_for_scheme(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    # Verify user and scheme exist
    user = db.query(models.User).filter(models.User.id == application.user_id).first()
    scheme = db.query(models.Scheme).filter(models.Scheme.id == application.scheme_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    db_application = models.Application(
        **application.dict(),
        status="Pending",
        submitted_documents={} 
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.post("/{application_id}/upload")
def upload_document(application_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    file_location = f"{UPLOAD_DIR}/{application_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update application documents
    docs = dict(application.submitted_documents) if application.submitted_documents else {}
    docs[file.filename] = file_location
    application.submitted_documents = docs
    
    # Needs explicit update for some SQL dialects/ORM versions with JSON types
    # But SQLAlchemy tracks mutations on calling refresh or commit usually if properly instrumented. 
    # For SQLite JSON, we might need to flag modified if it doesn't auto-detect.
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(application, "submitted_documents")

    db.commit()
    return {"filename": file.filename, "status": "uploaded"}
