from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    income = Column(Integer)
    occupation = Column(String)
    state = Column(String)
    caste = Column(String)
    disability = Column(Boolean, default=False)
    
    applications = relationship("Application", back_populates="user")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    ministry = Column(String)
    eligibility_criteria = Column(JSON) # Store as JSON for flexibility
    documents_required = Column(JSON) # List of document names
    benefits = Column(Text)
    
    applications = relationship("Application", back_populates="scheme")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scheme_id = Column(Integer, ForeignKey("schemes.id"))
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    submitted_documents = Column(JSON) # Store paths or status of docs

    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")
