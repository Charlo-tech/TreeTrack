import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  organization: z.string().max(120).optional(),
  boundary: z.unknown().optional(),
  total_area_hectares: z.number().positive().optional(),
  expected_tree_count: z.number().int().positive().optional(),
});

export const createPlotSchema = z.object({
  plot_code: z.string().min(1).max(20),
  geometry: z.unknown(),
  area_hectares: z.number().positive(),
  expected_tree_count: z.number().int().positive().optional(),
  status: z.enum(["active", "monitoring", "archived"]).optional(),
});

export const visionAnalyzeSchema = z.object({
  imagery_id: z.string().uuid().optional(),
  plot_id: z.string().uuid().optional(),
  image_url: z.string().url().optional(),
});

export const analyticsAnalyzeSchema = z.object({
  plot_id: z.string().uuid(),
  observations: z
    .array(
      z.object({
        observation_date: z.string(),
        ndvi: z.number().nullable(),
        vegetation_coverage: z.number().nullable().optional(),
        canopy_density: z.number().nullable().optional(),
        estimated_tree_count: z.number().nullable().optional(),
        health_score: z.number().nullable().optional(),
      })
    )
    .min(1),
});

export const fieldReportSchema = z.object({
  plot_id: z.string().uuid(),
  reporter_name: z.string().min(2).max(120),
  reporter_phone: z.string().min(7).max(20),
  event_type: z.enum([
    "tree_loss",
    "fire",
    "illegal_clearing",
    "disease",
    "pest",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10).max(2000),
  location: z.unknown().optional(),
  image_url: z.string().url().optional().nullable(),
});

export const smsSchema = z.object({
  recipient: z.string().min(7),
  message: z.string().min(1).max(1600),
  alert_id: z.string().uuid().optional(),
});

export const ussdSchema = z.object({
  sessionId: z.string().optional(),
  phoneNumber: z.string().optional(),
  text: z.string().optional(),
  serviceCode: z.string().optional(),
});
