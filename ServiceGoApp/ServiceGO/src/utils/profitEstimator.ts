import type { ConfiguracaoUsuario, Trip } from "../types/api";

export interface TripProfitEstimate {
  operationalDistanceKm: number;
  fuelCost: number;
  tollCost: number;
  depreciationCost: number;
  totalCost: number;
  profit: number;
  profitPerKm: number;
  profitPerHour: number;
}

function calculateAutomaticDepreciationPerKm(config: ConfiguracaoUsuario | null) {
  if (!config) {
    return 0;
  }
  const valorAtual = Number(config.valorAtualVeiculo ?? 0);
  const valorVenda = Number(config.valorEstimadoVeiculo ?? 0);
  const kmPeriodo = Number(config.kmBaseDepreciacao ?? 0);
  const depreciacaoTotal = Math.max(0, valorAtual - valorVenda);
  return depreciacaoTotal > 0 && kmPeriodo > 0 ? depreciacaoTotal / kmPeriodo : 0;
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
    return calculateAutomaticDepreciationPerKm(config) * distanceKm;
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
  estimatedMinutes: number;
  tollCost?: number;
}): TripProfitEstimate {
  const revenue = Number(params.trip.actualAmount ?? params.trip.estimatedAmount ?? 0);
  const distanceKm = Number(params.trip.distanceKm ?? 0);
  const operationalDistanceKm = distanceKm > 0 ? distanceKm * 2 : 0;
  const tollCost = Number(params.tollCost ?? 0);
  const fuelPrice = Number(params.trip.fuelPrice ?? params.config?.fuelPrice ?? 0);
  const fuelEfficiencyKmPerLiter = Number(params.trip.fuelEfficiencyKmLiter ?? params.config?.fuelEfficiencyKmLiter ?? 0);
  const fuelCost =
    fuelPrice > 0 && fuelEfficiencyKmPerLiter > 0
      ? (operationalDistanceKm / fuelEfficiencyKmPerLiter) * fuelPrice
      : 0;
  const depreciationCost = calculateDepreciationForTrip(params.config, operationalDistanceKm, params.estimatedMinutes);
  const totalCost = fuelCost + depreciationCost + tollCost;
  const profit = revenue - totalCost;
  const profitPerKm = operationalDistanceKm > 0 ? profit / operationalDistanceKm : 0;
  const profitPerHour = params.estimatedMinutes > 0 ? profit / (params.estimatedMinutes / 60) : 0;
  return {
    operationalDistanceKm,
    fuelCost,
    tollCost,
    depreciationCost,
    totalCost,
    profit,
    profitPerKm,
    profitPerHour,
  };
}
