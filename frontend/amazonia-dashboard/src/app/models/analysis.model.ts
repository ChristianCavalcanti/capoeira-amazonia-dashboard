/** Response from /api/analysis/trends */
export interface RestorationTrend {
  year: number;
  region: string;
  area_restored: number;
  carbon: number;
  carbon_per_hectare: number | null;
  restoration_growth_rate_pct: number | null;
}

/** Response from /api/analysis/carbon-efficiency */
export interface CarbonEfficiency {
  region: string;
  year: number;
  carbon_per_hectare: number;
  area_restored: number;
  carbon: number;
}

/** Response from /api/analysis/region-performance */
export interface RegionPerformance {
  region: string;
  total_area_restored: number;
  total_carbon: number;
  mean_carbon_per_hectare: number;
}

/** Response from /api/analysis/method-contribution */
export interface MethodContribution {
  restoration_type: string;
  percentage: number;
}

/** Response from /api/analysis/insights (localized) */
export interface ScientificInsight {
  id: string;
  text: string;
}
