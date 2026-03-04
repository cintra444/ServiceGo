export const currency = (value?: number | null) => {
  const safeValue = Number(value ?? 0);
  return safeValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const dateTime = (iso?: string | null) => {
  if (!iso) {
    return "-";
  }
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return iso;
  }
  return dt.toLocaleString("pt-BR");
};

export const dateOnly = (iso?: string | null) => {
  if (!iso) {
    return "-";
  }
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return iso;
  }
  return dt.toLocaleDateString("pt-BR");
};

export const parseNumber = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const cleanText = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized ? normalized : undefined;
};
