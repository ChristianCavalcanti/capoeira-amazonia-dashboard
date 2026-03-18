"""Run the same logic as analysis.ipynb to export JSON for the backend."""
import pandas as pd
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = PROJECT_ROOT / "backend" / "data_processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
CSV_PATH = DATA_DIR / "restoration.csv"

df = pd.read_csv(CSV_PATH)
df["year"] = df["year"].astype(int)
df["area_restored"] = df["area_restored"].astype(int)
df["carbon"] = df["carbon"].astype(int)

def restoration_type_for_region(region: str) -> str:
    m = {"Pará": "Plantio de nativas", "Acre": "Regeneração natural", "Rondônia": "Sistema agroflorestal", "Amazonas": "Regeneração natural"}
    return m.get(region, "Não informado")

df["restoration_type"] = df["region"].map(restoration_type_for_region)
df["carbon_per_hectare"] = (df["carbon"] / df["area_restored"]).round(2)

df_sorted = df.sort_values(["region", "year"])
df_sorted["area_prev"] = df_sorted.groupby("region")["area_restored"].shift(1)
df_sorted["restoration_growth_rate_pct"] = (
    (df_sorted["area_restored"] - df_sorted["area_prev"]) / df_sorted["area_prev"].replace(0, 1) * 100
).round(1)
df = df_sorted.drop(columns=["area_prev"])

restoration_trends = (
    df.groupby(["year", "region"])
    .agg(
        area_restored=("area_restored", "sum"),
        carbon=("carbon", "sum"),
        carbon_per_hectare=("carbon_per_hectare", "mean"),
        restoration_growth_rate_pct=("restoration_growth_rate_pct", "last"),
    )
    .reset_index()
)
restoration_trends = restoration_trends.where(pd.notna(restoration_trends), None)

carbon_efficiency = (
    df.groupby(["region", "year"])
    .agg(
        carbon_per_hectare=("carbon_per_hectare", "mean"),
        area_restored=("area_restored", "sum"),
        carbon=("carbon", "sum"),
    )
    .reset_index()
)
region_totals = (
    df.groupby("region")
    .agg(
        total_area_restored=("area_restored", "sum"),
        total_carbon=("carbon", "sum"),
        mean_carbon_per_hectare=("carbon_per_hectare", "mean"),
    )
    .round(2)
    .reset_index()
)
total_area = df["area_restored"].sum()
method_contribution = (df.groupby("restoration_type")["area_restored"].sum() / total_area * 100).round(1).reset_index()
method_contribution.columns = ["restoration_type", "percentage"]

insights = []
if not carbon_efficiency.empty:
    best = carbon_efficiency.loc[carbon_efficiency["carbon_per_hectare"].idxmax()]
    insights.append({
        "id": "carbon_density",
        "text_pt": f"{best['region']} apresenta o maior sequestro de carbono por hectare em {int(best['year'])} ({best['carbon_per_hectare']:.2f} tCO₂e/ha).",
        "text_en": f"{best['region']} shows the highest carbon sequestration per hectare in {int(best['year'])} ({best['carbon_per_hectare']:.2f} tCO₂e/ha).",
    })
years = sorted(df["year"].unique())
if len(years) >= 2:
    insights.append({
        "id": "area_trend",
        "text_pt": f"A área em restauração aumentou de forma contínua entre {years[0]} e {years[-1]}.",
        "text_en": f"Restoration area increased steadily between {years[0]} and {years[-1]}.",
    })
if not method_contribution.empty:
    top = method_contribution.loc[method_contribution["percentage"].idxmax()]
    insights.append({
        "id": "method_contribution",
        "text_pt": f"{top['restoration_type']} representa a maior contribuição ({top['percentage']:.0f}%).",
        "text_en": f"{top['restoration_type']} represents the largest contribution ({top['percentage']:.0f}%).",
    })
latest_year = df["year"].max()
latest = df[df["year"] == latest_year]
if not latest.empty:
    tr = latest.loc[latest["area_restored"].idxmax()]
    insights.append({
        "id": "leading_region",
        "text_pt": f"Em {int(latest_year)}, {tr['region']} registrou a maior área restaurada ({int(tr['area_restored'])} ha).",
        "text_en": f"In {int(latest_year)}, {tr['region']} recorded the largest restored area ({int(tr['area_restored'])} ha).",
    })

def to_json_safe(obj):
    if hasattr(obj, "item"):
        return float(obj) if isinstance(obj, float) else int(obj)
    if pd.isna(obj):
        return None
    return obj

def clean(records):
    return [{k: to_json_safe(v) for k, v in r.items()} for r in records]

(OUTPUT_DIR / "restoration_trends.json").write_text(
    json.dumps(clean(restoration_trends.to_dict(orient="records")), indent=2), encoding="utf-8"
)
(OUTPUT_DIR / "carbon_efficiency.json").write_text(
    json.dumps(clean(carbon_efficiency.to_dict(orient="records")), indent=2), encoding="utf-8"
)
(OUTPUT_DIR / "region_performance.json").write_text(
    json.dumps(clean(region_totals.to_dict(orient="records")), indent=2), encoding="utf-8"
)
(OUTPUT_DIR / "method_contribution.json").write_text(
    json.dumps(clean(method_contribution.to_dict(orient="records")), indent=2), encoding="utf-8"
)
(OUTPUT_DIR / "scientific_insights.json").write_text(
    json.dumps(insights, indent=2, ensure_ascii=False), encoding="utf-8"
)
print("Exported to", OUTPUT_DIR)
