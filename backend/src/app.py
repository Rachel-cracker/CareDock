from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import jwt
from dotenv import load_dotenv
import os
from .routes import task, resource, selfcare, auth, ai_routes, profile

load_dotenv()

app = FastAPI()

#cross region access share
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Health check endpoint for deployment platforms
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "CareDock API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(task.router)
app.include_router(resource.router)
app.include_router(selfcare.router)
app.include_router(auth.router)
app.include_router(ai_routes.router)
app.include_router(profile.router)