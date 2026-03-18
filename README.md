# Amazonia Restoration Platform

Scientific platform for monitoring forest restoration in the Amazon.

## Stack

- **Angular** — Frontend (dashboards, map, data lab)
- **FastAPI** — Backend API
- **Python** — Data processing
- **Jupyter** — Analysis (notebooks)

## Features

- Interactive dashboards and scientific indicators
- Map visualization of restoration data
- Data lab with charts and tables (region, year, area, carbon)
- Catalog of scientific bases
- Bilingual (PT-BR / EN)

## Project structure

```
Amazonia/
├── backend/          # FastAPI API
│   ├── main.py
│   ├── requirements.txt
│   └── data_processed/
├── frontend/
│   └── amazonia-dashboard/   # Angular app
├── notebooks/        # Jupyter analysis
├── data/             # Datasets (e.g. restoration.csv)
├── main.py           # Entrypoint for uvicorn from repo root
└── README.md
```

## Local development

### Backend

From the repo root (recommended):

```powershell
cd G:\Amazonia
.\backend\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Or from the backend folder:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend/amazonia-dashboard
npm install
ng serve
```

App: http://localhost:4200

## Deployment

- **Frontend:** Vercel (connect repo, build from `frontend/amazonia-dashboard`)
- **Backend:** Render — connect repo, **root directory**, build command: `pip install -r backend/requirements.txt`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT` (Render sets `PORT` automatically).

The virtual environment is not committed; dependencies are in `backend/requirements.txt` so the environment can be recreated on any platform.

## License

Project for CAPOEIRA — Centro Avançado em Pesquisas Socioecológicas para a Recuperação Ambiental da Amazônia.
