from pydantic import BaseModel
from typing import List, Optional, Any

class UserBase(BaseModel):
    name: str
    age: int
    gender: str
    income: int
    occupation: str
    state: str
    caste: str
    disability: bool = False

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    # applications: List[Application] = [] # Avoid circular dependency for now

    class Config:
        from_attributes = True

class SchemeBase(BaseModel):
    name: str
    description: str
    ministry: str
    eligibility_criteria: Any # JSON
    documents_required: Any # JSON
    benefits: str

class SchemeCreate(SchemeBase):
    pass

class Scheme(SchemeBase):
    id: int

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    user_id: int
    scheme_id: int

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    status: str
    submitted_documents: Any # JSON

    class Config:
        from_attributes = True
