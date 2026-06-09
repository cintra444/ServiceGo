import {
  NeighborhoodDetectionResult,
  RuleEvaluationResult,
} from "@/modules/smart-driver/types";
import { normalizeNeighborhood } from "@/modules/smart-driver/utils/text";

export function evaluateRideBlocking(
  neighborhoods: NeighborhoodDetectionResult,
  blockedNeighborhoods: string[],
): RuleEvaluationResult {
  const blockedSet = new Set(blockedNeighborhoods.map(normalizeNeighborhood).filter(Boolean));
  const candidates = [neighborhoods.origin, neighborhoods.destination]
    .filter(Boolean)
    .map(item => normalizeNeighborhood(item?.label ?? ""));

  const matchedNeighborhoods = candidates.filter(candidate => blockedSet.has(candidate));

  return {
    blocked: matchedNeighborhoods.length > 0,
    matchedNeighborhoods,
    reason:
      matchedNeighborhoods.length > 0
        ? "Bairro bloqueado encontrado na corrida analisada."
        : "Nenhum bairro bloqueado foi identificado.",
  };
}

