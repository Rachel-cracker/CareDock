from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Boolean, ForeignKey, create_engine, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()  

Base = declarative_base()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback for local development
    DATABASE_URL = "sqlite:///./careDock.db"
    print("Warning: Using SQLite database for development. Set DATABASE_URL environment variable for production.")

engine = create_engine(DATABASE_URL, echo=False)  # Disable echo for production 


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String)
    # link to tasks
    tasks = relationship("Task", back_populates="user")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    # start time          
    time = Column(Time, nullable=False)
    duration = Column(Integer, nullable=False)
    # high, medium, low   
    priority = Column(String, nullable=False)
    # medication, appointment, etc.
    category = Column(String, nullable=False)
    notes = Column(String)
    # pending, in-progress, completed
    status = Column(String, default="pending")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="tasks")


class Resource_File(Base):
    __tablename__ = "resource_files"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    # daily-care, emergency, financial, medical, skills, community
    category = Column(String, nullable=False)
    description = Column(Text)
    pages = Column(Integer)
    is_downloadable = Column(Boolean, default=True)
    source_url = Column(String)                     

class Selfcare_File(Base):
    __tablename__ = "selfcare_files"
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    #video, audio, text
    media_type = Column(String, nullable=False)
    video_url = Column(String)
    duration_seconds = Column(Integer)
    #mental, physical
    focus_area = Column(String, nullable=False)
    description = Column(Text) 
    steps = Column(Text)
    benefits = Column(Text)
    tags = Column(String)

#convert models to sql
Base.metadata.create_all(engine)

#allows a seesion to represent a database connection
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#make sure don't keep creating duplicates or messing up the database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()