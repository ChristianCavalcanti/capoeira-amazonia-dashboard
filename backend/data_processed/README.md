# Processed analysis data

This folder is populated by the **scientific analysis pipeline** (Jupyter notebook or Python script).

## Generated files

| File | Description |
|------|-------------|
| `restoration_trends.json` | Area, carbon, growth rate by year and region |
| `carbon_efficiency.json` | Carbon per hectare by region and year |
| `region_performance.json` | Total area, total carbon, mean carbon/ha per region |
| `method_contribution.json` | Percentage of restored area by restoration type |
| `scientific_insights.json` | Automated insights (PT/EN) for the dashboard |

## Regenerating data

From the project root:

```bash
# Using the backend venv (has pandas)
python notebooks/run_analysis.py
```

Or run all cells in `notebooks/analysis.ipynb` (with `notebooks` as current directory so paths resolve correctly).

The FastAPI endpoints under `/api/analysis/*` serve these JSON files. If a file is missing, the endpoint returns an empty list.
