from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON, Float
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Auth fields
    phone = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)

    # Profile fields (nullable — filled during onboarding)
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    address = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    income = Column(Integer, nullable=True)
    caste = Column(String, nullable=True)  # General / OBC / SC / ST
    education = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    num_dependents = Column(Integer, nullable=True)
    land_area = Column(Float, nullable=True)  # in acres
    ration_card_type = Column(String, nullable=True)  # APL / BPL / AAY / None
    disability = Column(Boolean, default=False)

    profile_completed = Column(Boolean, default=False)

    applications = relationship("Application", back_populates="user")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    ministry = Column(String)
    eligibility_criteria = Column(JSON)
    documents_required = Column(JSON)
    benefits = Column(Text)

    applications = relationship("Application", back_populates="scheme")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scheme_id = Column(Integer, ForeignKey("schemes.id"))
    status = Column(String, default="Pending")
    submitted_documents = Column(JSON)

    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")
