from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, models, schemas
from routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.patch("/me/profile", response_model=schemas.UserOut)
def update_profile(
    update: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Re-query user in THIS session to avoid cross-session issues
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    # Check if core fields are filled to mark profile complete
    if all([
        user.name,
        user.age,
        user.gender,
        user.state,
        user.occupation,
        user.income is not None,
    ]):
        user.profile_completed = True

    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=schemas.UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
