export interface ImageryRecord {
  id: string;
  plot_id: string;
  captured_at: string;
  source: string;
  image_url: string;
  thumbnail_url?: string | null;
  analysis_status: "pending" | "processing" | "completed" | "failed";
  metadata?: Record<string, unknown> | null;
}

export interface ImageryProvider {
  list(plot_id: string): Promise<ImageryRecord[]>;
  get(id: string): Promise<ImageryRecord | null>;
}
