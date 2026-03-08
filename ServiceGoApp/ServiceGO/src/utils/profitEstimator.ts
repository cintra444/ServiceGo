import type { ConfiguracaoUsuario, Trip } from "../types/api";

export interface TripProfitEstimate {
  fuelCost: number;
  depreciationCost: number;
  totalCost: number;
  profit: number;
  profitPerKm: number;
  profitPerHour: number;
}

export function calculateDepreciationForTrip(
  config: ConfiguracaoUsuario | null,
  distanceKm: number,
  estimatedMinutes: number,
) {
  if (!config || distanceKm <= 0 || estimatedMinutes <= 0) {
    return 0;
  }

  let unitValue = 0;
  if (config.depreciacaoModo === "MANUAL") {
    if (config.depreciacaoAlocacao === "POR_KM") {
      unitValue = Number(config.valorManualPorKm ?? 0);
    } else if (config.depreciacaoAlocacao === "MENSAL") {
      unitValue = Number(config.valorManualMensal ?? 0);
    } else {
      unitValue = Number(config.valorManualAnual ?? 0);
    }
  } else {
    const valorAtual = Number(config.valorAtualVeiculo ?? 0);
    const valorEstimado = Number(config.valorEstimadoVeiculo ?? 0);
    const depreciacaoTotal = Math.max(0, valorAtual - valorEstimado);
    if (config.depreciacaoAlocacao === "POR_KM") {
      const base = Number(config.kmBaseDepreciacao ?? 0);
      unitValue = base > 0 ? depreciacaoTotal / base : 0;
    } else if (config.depreciacaoAlocacao === "MENSAL") {
      const base = Number(config.mesesBaseDepreciacao ?? 0);
      unitValue = base > 0 ? depreciacaoTotal / base : 0;
    } else {
      const base = Number(config.anosBaseDepreciacao ?? 0);
      unitValue = base > 0 ? depreciacaoTotal / base : 0;
    }
  }

  if (config.depreciacaoAlocacao === "POR_KM") {
    return unitValue * distanceKm;
  }
  if (config.depreciacaoAlocacao === "MENSAL") {
    return unitValue * (estimatedMinutes / (30 * 24 * 60));
  }
  return unitValue * (estimatedMinutes / (365 * 24 * 60));
}

export function estimateTripProfit(params: {
  trip: Trip;
  config: ConfiguracaoUsuario | null;
  fuelPrice: number;
  fuelEfficiencyKmPerLiter: number;
  estimatedMinutes: number;
}): TripProfitEstimate {
  const revenue = Number(params.trip.actualAmount ?? params.trip.estimatedAmount ?? 0);
  const distanceKm = Number(params.trip.distanceKm ?? 0);
  const fuelCost =
    params.fuelPrice > 0 && params.fuelEfficiencyKmPerLiter > 0
      ? (distanceKm / params.fuelEfficiencyKmPerLiter) * params.fuelPrice
      : 0;
  const depreciationCost = calculateDepreciationForTrip(params.config, distanceKm, params.estimatedMinutes);
  const totalCost = fuelCost + depreciationCost;
  const profit = revenue - totalCost;
  const profitPerKm = distanceKm > 0 ? profit / distanceKm : 0;
  const profitPerHour = params.estimatedMinutes > 0 ? profit / (params.estimatedMinutes / 60) : 0;
  return {
    fuelCost,
    depreciationCost,
    totalCost,
    profit,
    profitPerKm,
    profitPerHour,
  };
}
