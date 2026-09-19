import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Plot health / status ---

export type PlotStatus = "healthy" | "needs_attention" | "at_risk" | "critical";

export function getPlotStatus(score: number | null | undefined): PlotStatus {
  if (score == null || isNaN(score)) return "needs_attention";
  if (score >= 75) return "healthy";
  if (score >= 50) return "needs_attention";
  if (score >= 30) return "at_risk";
  return "critical";
}

export function getPlotStatusLabel(status: PlotStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "needs_attention":
      return "Needs attention";
    case "at_risk":
      return "At risk";
    case "critical":
      return "Critical";
  }
}

export function getPlotStatusColor(status: PlotStatus): string {
  switch (status) {
    case "healthy":
      return "#16a34a"; // green-600
    case "needs_attention":
      return "#eab308"; // yellow-500
    case "at_risk":
      return "#f97316"; // orange-500
    case "critical":
      return "#dc2626"; // red-600
  }
}

export function getPlotStyle(status: PlotStatus) {
  const color = getPlotStatusColor(status);
  return {
    fillColor: color,
    color: "#ffffff",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.55,
  };
}

// --- NDVI ---

export function calculateNDVI(nir: number, red: number): number | null {
  if (
    typeof nir !== "number" ||
    typeof red !== "number" ||
    isNaN(nir) ||
    isNaN(red) ||
    nir < 0 ||
    red < 0
  )
    return null;
  const denom = nir + red;
  if (denom === 0) return null;
  const ndvi = (nir - red) / denom;
  // NDVI is bounded [-1, 1]
  if (ndvi < -1 || ndvi > 1) return null;
  return Math.round(ndvi * 1000) / 1000;
}

export function calculateNDVIChange(
  previous: number | null,
  current: number | null
): number | null {
  if (previous == null || current == null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return Math.round(change * 10) / 10;
}

export function formatHectares(v: number | null): string {
  if (v == null) return "—";
  return `${v.toFixed(1)} ha`;
}

export function formatNumber(v: number | null | undefined): string {
  if (v == null) return "—";
  return new Intl.NumberFormat().format(Math.round(v));
}

export function daysAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return { success: true as const, data, ...(meta ? { meta } : {}) };
}

export function apiError(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: { code, message, ...(details ? { details } : {}) },
  };
}
