export interface ScreenTextNode {
  text: string;
  viewId?: string | null;
  className?: string | null;
  contentDescription?: string | null;
}

export interface ScreenTextSnapshot {
  packageName: string;
  eventType: string;
  capturedAt: string;
  combinedText: string;
  nodes: ScreenTextNode[];
}

export interface RideCandidate {
  packageName: string;
  score: number;
  matchedKeywords: string[];
  lines: string[];
  rawText: string;
}

export type NeighborhoodSource = "origin" | "destination" | "unknown";

export interface ParsedNeighborhood {
  label: string | null;
  source: NeighborhoodSource;
  confidence: number;
  rawLine: string;
}

export interface NeighborhoodDetectionResult {
  origin: ParsedNeighborhood | null;
  destination: ParsedNeighborhood | null;
}

export interface RuleEvaluationResult {
  blocked: boolean;
  matchedNeighborhoods: string[];
  reason: string;
}

export interface SmartDriverState {
  accessibilityConnected: boolean;
  lastSnapshot: ScreenTextSnapshot | null;
  lastRideCandidate: RideCandidate | null;
  lastNeighborhoods: NeighborhoodDetectionResult | null;
  lastRuleEvaluation: RuleEvaluationResult | null;
  blockedNeighborhoods: string[];
}

