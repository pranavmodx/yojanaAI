from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import auth, users, schemes, apply

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="YojanaAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(schemes.router)
app.include_router(apply.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to YojanaAI API"}
