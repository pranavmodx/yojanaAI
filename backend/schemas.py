from pydantic import BaseModel
from typing import Optional, Any


# ── Auth ──────────────────────────────────────────────
class SignupRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str


class LoginRequest(BaseModel):
    identifier: str  # phone or email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    profile_completed: bool


# ── Profile ───────────────────────────────────────────
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[int] = None
    caste: Optional[str] = None
    education: Optional[str] = None
    marital_status: Optional[str] = None
    num_dependents: Optional[int] = None
    land_area: Optional[float] = None
    ration_card_type: Optional[str] = None
    disability: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    phone: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[int] = None
    caste: Optional[str] = None
    education: Optional[str] = None
    marital_status: Optional[str] = None
    num_dependents: Optional[int] = None
    land_area: Optional[float] = None
    ration_card_type: Optional[str] = None
    disability: bool = False
    profile_completed: bool = False

    class Config:
        from_attributes = True


# ── Schemes ───────────────────────────────────────────
class SchemeBase(BaseModel):
    name: str
    description: str
    ministry: str
    eligibility_criteria: Any
    documents_required: Any
    benefits: str


class SchemeCreate(SchemeBase):
    pass


class Scheme(SchemeBase):
    id: int

    class Config:
        from_attributes = True


# ── Applications ──────────────────────────────────────
class ApplicationBase(BaseModel):
    user_id: int
    scheme_id: int


class ApplicationCreate(ApplicationBase):
    pass


class Application(ApplicationBase):
    id: int
    status: str
    submitted_documents: Any

    class Config:
        from_attributes = True
