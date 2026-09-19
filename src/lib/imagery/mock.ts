import type { ImageryProvider, ImageryRecord } from "./types";
import { MOCK_IMAGERY } from "@/lib/mock-data";

export class MockImageryProvider implements ImageryProvider {
  async list(plot_id: string): Promise<ImageryRecord[]> {
    return MOCK_IMAGERY.filter((i) => i.plot_id === plot_id) as ImageryRecord[];
  }
  async get(id: string): Promise<ImageryRecord | null> {
    return (MOCK_IMAGERY.find((i) => i.id === id) as ImageryRecord) ?? null;
  }
}
