from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas

router = APIRouter(
    prefix="/schemes",
    tags=["schemes"],
    responses={404: {"description": "Not found"}},
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Scheme)
def create_scheme(scheme: schemas.SchemeCreate, db: Session = Depends(get_db)):
    db_scheme = models.Scheme(**scheme.dict())
    db.add(db_scheme)
    db.commit()
    db.refresh(db_scheme)
    return db_scheme

@router.get("/", response_model=List[schemas.Scheme])
def read_schemes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    schemes = db.query(models.Scheme).offset(skip).limit(limit).all()
    return schemes

from services.ai_service import ai_service
@router.get("/recommend/{user_id}", response_model=List[schemas.Scheme])
def recommend_schemes(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    all_schemes = db.query(models.Scheme).all()
    recommended = ai_service.recommend_schemes(user, all_schemes)
    return recommended
