import { RIDE_KEYWORDS } from "@/core/config/targetPackages";
import { RideCandidate, ScreenTextSnapshot } from "@/modules/smart-driver/types";
import { normalizeText, splitVisibleLines } from "@/modules/smart-driver/utils/text";

export function detectRideCandidate(snapshot: ScreenTextSnapshot): RideCandidate | null {
  const rawText = snapshot.combinedText.trim();
  if (!rawText) {
    return null;
  }

  const normalized = normalizeText(rawText);
  const matchedKeywords = RIDE_KEYWORDS.filter(keyword => normalized.includes(keyword));
  let score = matchedKeywords.length;

  if (/\br\$\s?\d+/i.test(rawText)) {
    score += 1;
  }

  if (/\b\d+([.,]\d+)?\s?km\b/i.test(rawText)) {
    score += 1;
  }

  const lines = splitVisibleLines(snapshot.combinedText);
  if (lines.length >= 3) {
    score += 1;
  }

  if (score < 3) {
    return null;
  }

  return {
    packageName: snapshot.packageName,
    score,
    matchedKeywords: [...matchedKeywords],
    lines,
    rawText: snapshot.combinedText,
  };
}

