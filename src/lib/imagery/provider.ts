import type { ImageryProvider } from "./types";
import { MockImageryProvider } from "./mock";
import { createAdminClient } from "@/lib/supabase/admin";

export function getImageryProvider(): ImageryProvider {
  return new MockImageryProvider();
}

export async function listImagery(plot_id: string) {
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("imagery")
      .select("*")
      .eq("plot_id", plot_id)
      .order("captured_at", { ascending: false });
    if (data && data.length) return data;
  }
  return new MockImageryProvider().list(plot_id);
}
