from pathlib import Path
from datetime import datetime
import sqlite3

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import pandas as pd

app = FastAPI()


def get_preferred_language(accept_language: str | None = Header(default=None, alias="Accept-Language")) -> str:
    """Parse Accept-Language header; return 'pt-BR' or 'en' (default en)."""
    if not accept_language:
        return "en"
    # Simple parse: first listed language (e.g. "pt-BR,en;q=0.9" -> pt-BR)
    first = accept_language.split(",")[0].strip().split(";")[0].strip().lower()
    if first.startswith("pt"):
        return "pt-BR"
    return "en"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        # Optional: Vercel preview/prod domains (allows calls from the hosted frontend)
        "https://capoeira-amazonia-dashboard.vercel.app",
    ],
    # Vercel app urls often look like: https://<project>-<hash>.vercel.app
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "restoration.csv"
DATA_PROCESSED_DIR = BASE_DIR / "data_processed"
DB_PATH = BASE_DIR / "subscribers.sqlite3"


def _load_analysis_json(filename: str):
    """Load a JSON file from data_processed; return list or dict; empty list/dict if missing."""
    path = DATA_PROCESSED_DIR / filename
    if not path.exists():
        return []
    import json
    with open(path, encoding="utf-8") as f:
        return json.load(f)


class SubscriberIn(BaseModel):
  name: str
  email: EmailStr


def get_connection() -> sqlite3.Connection:
  conn = sqlite3.connect(DB_PATH)
  return conn


@app.on_event("startup")
def init_db() -> None:
  conn = get_connection()
  cur = conn.cursor()
  cur.execute(
    """
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
    """
  )
  conn.commit()
  conn.close()


@app.get("/")
def read_root(accept_language: str | None = Header(default=None, alias="Accept-Language")):
    lang = get_preferred_language(accept_language)
    messages = {"pt-BR": "API de Restauração da Amazônia", "en": "Amazon Restoration API"}
    return {"message": messages.get(lang, messages["en"]), "language": lang}


@app.get("/restoration")
def restoration_data():
    df = pd.read_csv(DATA_PATH)
    df["year"] = df["year"].astype(int)
    df["area_restored"] = df["area_restored"].astype(int)
    df["carbon"] = df["carbon"].astype(int)
    return df.to_dict(orient="records")


# ----- Scientific analysis endpoints (data from notebook export) -----

@app.get("/api/analysis/trends")
def analysis_trends():
    return _load_analysis_json("restoration_trends.json")


@app.get("/api/analysis/carbon-efficiency")
def analysis_carbon_efficiency():
    return _load_analysis_json("carbon_efficiency.json")


@app.get("/api/analysis/region-performance")
def analysis_region_performance():
    return _load_analysis_json("region_performance.json")


@app.get("/api/analysis/method-contribution")
def analysis_method_contribution():
    return _load_analysis_json("method_contribution.json")


@app.get("/api/analysis/insights")
def analysis_insights(
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
):
    data = _load_analysis_json("scientific_insights.json")
    if not data:
        return []
    lang = get_preferred_language(accept_language)
    key = "text_pt" if lang == "pt-BR" else "text_en"
    return [{"id": item["id"], "text": item.get(key, item.get("text_en", ""))} for item in data]


@app.post("/subscribers", status_code=201)
def create_subscriber(
    subscriber: SubscriberIn,
    accept_language: str | None = Header(default=None, alias="Accept-Language"),
):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO subscribers (name, email, created_at)
            VALUES (?, ?, ?)
            """,
            (
                subscriber.name.strip(),
                subscriber.email.lower(),
                datetime.utcnow().isoformat(timespec="seconds"),
            ),
        )
        conn.commit()
        subscriber_id = cur.lastrowid
        conn.close()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=500, detail="Failed to persist subscriber"
        ) from exc

    lang = get_preferred_language(accept_language)
    return {
        "id": subscriber_id,
        "name": subscriber.name,
        "email": subscriber.email,
        "language": lang,
    }