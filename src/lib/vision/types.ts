export interface VisionInput {
  imagery_id?: string;
  plot_id?: string;
  image_url?: string;
  // optional hint for deterministic mock
  seed?: string;
}

export interface VisionAnalysis {
  vegetation_coverage: number; // 0-100
  canopy_density: number; // 0-100
  bare_soil_percentage: number;
  water_percentage: number;
  estimated_tree_count: number;
  confidence: number; // 0-1
  detected_changes: string[];
  provider: "mock" | "model";
  analyzed_at: string;
}

export interface VisionAnalyzer {
  analyze(input: VisionInput): Promise<VisionAnalysis>;
}
