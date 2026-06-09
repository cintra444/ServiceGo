import {
  NeighborhoodDetectionResult,
  NeighborhoodSource,
  ParsedNeighborhood,
  RideCandidate,
} from "@/modules/smart-driver/types";
import { normalizeNeighborhood } from "@/modules/smart-driver/utils/text";

const MARKERS: Array<{ source: NeighborhoodSource; regex: RegExp }> = [
  { source: "destination", regex: /(?:destino|para)\s*[:-]?\s*(.+)$/i },
  { source: "origin", regex: /(?:origem|embarque|buscar em)\s*[:-]?\s*(.+)$/i },
];

function createMatch(
  source: NeighborhoodSource,
  rawLine: string,
  extracted: string,
  confidence: number,
): ParsedNeighborhood | null {
  const label = normalizeNeighborhood(extracted);
  if (!label) {
    return null;
  }

  return {
    label,
    source,
    confidence,
    rawLine,
  };
}

export function parseNeighborhoods(candidate: RideCandidate): NeighborhoodDetectionResult {
  let origin: ParsedNeighborhood | null = null;
  let destination: ParsedNeighborhood | null = null;

  candidate.lines.forEach(line => {
    for (const marker of MARKERS) {
      const match = line.match(marker.regex);
      if (!match?.[1]) {
        continue;
      }

      const parsed = createMatch(marker.source, line, match[1], 0.9);
      if (!parsed) {
        continue;
      }

      if (parsed.source === "origin" && !origin) {
        origin = parsed;
      }

      if (parsed.source === "destination" && !destination) {
        destination = parsed;
      }
    }
  });

  if (!destination) {
    const fallbackLine = candidate.lines.find(line => /jardim|centro|bairro|vila|parque/i.test(line));
    if (fallbackLine) {
      destination = createMatch("unknown", fallbackLine, fallbackLine, 0.45);
    }
  }

  return {
    origin,
    destination,
  };
}
