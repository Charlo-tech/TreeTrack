import type { VisionAnalyzer } from "./types";
import { MockVisionAnalyzer } from "./mock";

let _analyzer: VisionAnalyzer | null = null;

export function getVisionAnalyzer(): VisionAnalyzer {
  if (_analyzer) return _analyzer;
  // Future: if MODEL_API_URL configured, return real analyzer
  // if (process.env.VISION_MODEL_URL) return new RemoteVisionAnalyzer(...)
  _analyzer = new MockVisionAnalyzer();
  return _analyzer;
}
