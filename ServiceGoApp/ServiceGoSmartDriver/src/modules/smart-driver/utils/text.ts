export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeNeighborhood(value: string) {
  return normalizeText(value).replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}

export function splitVisibleLines(text: string) {
  return text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
}

