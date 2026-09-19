export interface VegetationObservation {
  observation_date: string;
  ndvi: number | null;
  vegetation_coverage?: number | null;
  canopy_density?: number | null;
  estimated_tree_count?: number | null;
  health_score?: number | null;
}

export interface EnvironmentalAnalysisInput {
  plot_id: string;
  observations: VegetationObservation[];
}

export interface EnvironmentalAnalysisResult {
  plot_id: string;
  previous_ndvi: number | null;
  current_ndvi: number | null;
  ndvi_change_percent: number | null;
  trend: "stable" | "declining" | "improving" | "critical";
  risk_score: number; // 0-100
  health_score: number | null;
  summary: string;
  provider: "mock" | "wolfram";
  confidence: number;
  anomalies: string[];
  generated_at: string;
}

export interface EnvironmentalAnalyzer {
  analyze(input: EnvironmentalAnalysisInput): Promise<EnvironmentalAnalysisResult>;
}
