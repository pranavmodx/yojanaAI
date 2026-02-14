from fastapi import FastAPI
from database import engine
import models
from routes import users, schemes, apply

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="YojanaAI Backend")

app.include_router(users.router)
app.include_router(schemes.router)
app.include_router(apply.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to YojanaAI API"}
