"""
Stock Data Intelligence Dashboard — JarNox Internship Assignment
Backend: FastAPI + yfinance + SQLite + Pandas
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import init_db
from .routers import router

app = FastAPI(
    title="Stock Data Intelligence Dashboard",
    description="Mini financial data platform — JarNox Internship Assignment",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Since we run from stock_dashboard/ the static folder is relative to the cwd
# We can also make it absolute based on __file__ to be safe
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(router)

@app.on_event("startup")
def startup():
    init_db()
