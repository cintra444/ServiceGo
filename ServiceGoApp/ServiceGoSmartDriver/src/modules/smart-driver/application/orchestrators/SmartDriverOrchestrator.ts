import { logEvent } from "@/core/logging/logger";
import { detectRideCandidate } from "@/modules/smart-driver/domain/services/detectRideCandidate";
import { parseNeighborhoods } from "@/modules/smart-driver/domain/services/parseNeighborhoods";
import { evaluateRideBlocking } from "@/modules/smart-driver/domain/rules/evaluateRideBlocking";
import { smartDriverNative } from "@/modules/smart-driver/infrastructure/native/smartDriverNative";
import { ScreenTextSnapshot, SmartDriverState } from "@/modules/smart-driver/types";

const DEFAULT_OVERLAY_MESSAGE = "NAO ACEITAR";

export async function processScreenSnapshot(
  snapshot: ScreenTextSnapshot,
  previousState: SmartDriverState,
): Promise<Partial<SmartDriverState>> {
  logEvent("debug", "accessibility", "Snapshot recebido do servico nativo.", {
    packageName: snapshot.packageName,
    eventType: snapshot.eventType,
    textSize: snapshot.combinedText.length,
  });

  const rideCandidate = detectRideCandidate(snapshot);
  if (!rideCandidate) {
    await smartDriverNative.hideOverlay();
    return {
      lastSnapshot: snapshot,
      lastRideCandidate: null,
      lastNeighborhoods: null,
      lastRuleEvaluation: null,
    };
  }

  logEvent("info", "detector", "Possivel corrida identificada.", {
    score: rideCandidate.score,
    matchedKeywords: rideCandidate.matchedKeywords,
  });

  const neighborhoods = parseNeighborhoods(rideCandidate);
  logEvent("debug", "parser", "Bairros interpretados.", {
    origin: neighborhoods.origin?.label ?? null,
    destination: neighborhoods.destination?.label ?? null,
  });

  const evaluation = evaluateRideBlocking(
    neighborhoods,
    previousState.blockedNeighborhoods,
  );

  if (evaluation.blocked) {
    logEvent("warn", "rules", "Corrida bloqueada pelas regras.", {
      matchedNeighborhoods: evaluation.matchedNeighborhoods,
    });
    await smartDriverNative.showOverlay(DEFAULT_OVERLAY_MESSAGE);
  } else {
    await smartDriverNative.hideOverlay();
  }

  return {
    lastSnapshot: snapshot,
    lastRideCandidate: rideCandidate,
    lastNeighborhoods: neighborhoods,
    lastRuleEvaluation: evaluation,
  };
}

