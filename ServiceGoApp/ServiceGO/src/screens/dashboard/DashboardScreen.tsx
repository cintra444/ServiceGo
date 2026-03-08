import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PremiumGate } from "../../components/ui/PremiumGate";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGButton } from "../../components/ui/SGButton";
import { colors, spacing } from "../../constants/theme";
import { configuracaoApi, expensesApi, paymentsApi, tripsApi } from "../../services/api";
import { fuelSettingsStorage } from "../../services/storage";
import { useAuth } from "../../context/AuthContext";
import { currency, dateOnly } from "../../utils/format";
import { hasPremiumAccess } from "../../utils/plan";
import { estimateTripProfit } from "../../utils/profitEstimator";
import type { ConfiguracaoUsuario, Trip } from "../../types/api";

interface DashboardState {
  corridasHoje: number;
  corridasEmAndamento: number;
  receitaMes: number;
  despesasMes: number;
  insights: string[];
  projectedWeeklyRevenue: number | null;
  projectedMonthlyRevenue: number | null;
  projectedWeeklyProfit: number | null;
  projectedMonthlyProfit: number | null;
}

const MIN_COMPLETED_TRIPS_FOR_INSIGHTS = 20;
const MIN_COMPLETED_TRIPS_FOR_PROJECTION = 10;
const PROJECTION_WINDOW_DAYS = 14;

export function DashboardScreen() {
  const { session } = useAuth();
  const isPremium = hasPremiumAccess(session?.plan);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardState>({
    corridasHoje: 0,
    corridasEmAndamento: 0,
    receitaMes: 0,
    despesasMes: 0,
    insights: [],
    projectedWeeklyRevenue: null,
    projectedMonthlyRevenue: null,
    projectedWeeklyProfit: null,
    projectedMonthlyProfit: null,
  });

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      const [trips, payments, expenses] = await Promise.all([
        tripsApi.list(session.token),
        paymentsApi.list(session.token),
        expensesApi.list(session.token),
      ]);
      const fuelSettings = await fuelSettingsStorage.get();
      let config: ConfiguracaoUsuario | null = null;
      if (session.userId) {
        config = await configuracaoApi.get(session.token, session.userId);
      }
      const today = new Date().toISOString().slice(0, 10);
      const month = new Date().getMonth();
      const year = new Date().getFullYear();
      const corridasHoje = trips.filter((trip) => (trip.startAt ?? "").slice(0, 10) === today).length;
      const corridasEmAndamento = trips.filter((trip) => trip.status === "EM_ANDAMENTO").length;
      const receitaMes = payments
        .filter((payment) => {
          const ref = payment.paidAt ?? payment.dueAt;
          if (!ref) {
            return false;
          }
          const dt = new Date(ref);
          return dt.getFullYear() === year && dt.getMonth() === month;
        })
        .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
      const despesasMes = expenses
        .filter((expense) => {
          const dt = new Date(expense.occurredAt);
          return dt.getFullYear() === year && dt.getMonth() === month;
        })
        .reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
      const projections = buildProjections(
        trips,
        config,
        Number(fuelSettings.fuelPrice ?? 0),
        Number(fuelSettings.fuelEfficiencyKmPerLiter ?? 0),
      );
      const insights = buildInsights(trips, config, Number(fuelSettings.fuelPrice ?? 0), Number(fuelSettings.fuelEfficiencyKmPerLiter ?? 0));
      setData({
        corridasHoje,
        corridasEmAndamento,
        receitaMes,
        despesasMes,
        insights,
        projectedWeeklyRevenue: projections.projectedWeeklyRevenue,
        projectedMonthlyRevenue: projections.projectedMonthlyRevenue,
        projectedWeeklyProfit: projections.projectedWeeklyProfit,
        projectedMonthlyProfit: projections.projectedMonthlyProfit,
      });
    } catch {
      Alert.alert("Painel", "Não foi possível carregar os indicadores.");
    } finally {
      setLoading(false);
    }
  }, [session?.token, session?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const lucroMes = useMemo(() => data.receitaMes - data.despesasMes, [data.despesasMes, data.receitaMes]);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Ionicons name="speedometer-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.header}>Painel do motorista</Text>
      </View>
      <Text style={styles.sub}>Atualizado em {dateOnly(new Date().toISOString())}</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      <View style={styles.kpiGrid}>
        <SGCard title="Corridas hoje" style={styles.softCard}>
          <Text style={styles.kpi}>{data.corridasHoje}</Text>
        </SGCard>
        <SGCard title="Em andamento" style={styles.softCard}>
          <Text style={styles.kpi}>{data.corridasEmAndamento}</Text>
        </SGCard>
        <SGCard title="Receita do mês" style={styles.softCard}>
          <Text style={styles.kpi}>{currency(data.receitaMes)}</Text>
        </SGCard>
        <SGCard title="Despesas do mês" style={styles.softCard}>
          <Text style={styles.kpi}>{currency(data.despesasMes)}</Text>
        </SGCard>
      </View>

      <SGCard title="Saldo estimado do mês" style={styles.softCard}>
        <Text style={[styles.kpi, { color: lucroMes >= 0 ? colors.success : colors.danger }]}>
          {currency(lucroMes)}
        </Text>
      </SGCard>

      {isPremium ? (
        <>
          <SGCard title="Previsão de faturamento" style={styles.softCard}>
            {data.projectedWeeklyRevenue != null && data.projectedMonthlyRevenue != null ? (
              <>
                <Text style={styles.projectionLine}>Se continuar nesse ritmo:</Text>
                <Text style={styles.projectionLine}>Ganhos semanais estimados: {currency(data.projectedWeeklyRevenue)}</Text>
                <Text style={styles.projectionLine}>Ganhos mensais estimados: {currency(data.projectedMonthlyRevenue)}</Text>
                {data.projectedWeeklyProfit != null && data.projectedMonthlyProfit != null ? (
                  <>
                    <Text style={styles.projectionSub}>Lucro semanal estimado: {currency(data.projectedWeeklyProfit)}</Text>
                    <Text style={styles.projectionSub}>Lucro mensal estimado: {currency(data.projectedMonthlyProfit)}</Text>
                  </>
                ) : null}
                <Text style={styles.projectionHint}>Projeção baseada nos últimos {PROJECTION_WINDOW_DAYS} dias.</Text>
              </>
            ) : (
              <Text style={styles.insightText}>
                A projeção aparece após pelo menos {MIN_COMPLETED_TRIPS_FOR_PROJECTION} corridas concluídas recentes.
              </Text>
            )}
          </SGCard>

          <SGCard title="Insights" style={styles.softCard}>
            {data.insights.length > 0 ? (
              data.insights.map((item) => (
                <View key={item} style={styles.insightRow}>
                  <Ionicons name="analytics-outline" size={16} color={colors.primaryDark} />
                  <Text style={styles.insightText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.insightText}>
                Os insights aparecem apos pelo menos {MIN_COMPLETED_TRIPS_FOR_INSIGHTS} corridas concluidas com distancia e valor informados.
              </Text>
            )}
          </SGCard>
        </>
      ) : (
        <PremiumGate
          title="Painel inteligente"
          description="Libere previsão de faturamento e insights automáticos para acompanhar horários, regiões e corridas mais rentáveis."
        />
      )}

      <SGButton label="Atualizar painel" onPress={load} />
    </Screen>
  );
}

function buildProjections(
  trips: Trip[],
  config: ConfiguracaoUsuario | null,
  fuelPrice: number,
  fuelEfficiencyKmPerLiter: number,
) {
  const now = Date.now();
  const windowStart = now - PROJECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recentTrips = trips.filter((trip) => {
    if (trip.status !== "CONCLUIDA") {
      return false;
    }
    const startDate = new Date(trip.startAt);
    return !Number.isNaN(startDate.getTime()) && startDate.getTime() >= windowStart;
  });

  if (recentTrips.length < MIN_COMPLETED_TRIPS_FOR_PROJECTION) {
    return {
      projectedWeeklyRevenue: null,
      projectedMonthlyRevenue: null,
      projectedWeeklyProfit: null,
      projectedMonthlyProfit: null,
    };
  }

  const revenue = recentTrips.reduce((sum, trip) => sum + Number(trip.actualAmount ?? trip.estimatedAmount ?? 0), 0);
  const profit = recentTrips.reduce((sum, trip) => {
    const startDate = new Date(trip.startAt);
    const endDate = trip.endAt ? new Date(trip.endAt) : null;
    const estimatedMinutes =
      endDate && !Number.isNaN(endDate.getTime()) && !Number.isNaN(startDate.getTime())
        ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
        : 30;
    return (
      sum +
      estimateTripProfit({
        trip,
        config,
        fuelPrice,
        fuelEfficiencyKmPerLiter,
        estimatedMinutes,
      }).profit
    );
  }, 0);

  const dailyRevenue = revenue / PROJECTION_WINDOW_DAYS;
  const dailyProfit = profit / PROJECTION_WINDOW_DAYS;

  return {
    projectedWeeklyRevenue: dailyRevenue * 7,
    projectedMonthlyRevenue: dailyRevenue * 30,
    projectedWeeklyProfit: dailyProfit * 7,
    projectedMonthlyProfit: dailyProfit * 30,
  };
}

function buildInsights(
  trips: Trip[],
  config: ConfiguracaoUsuario | null,
  fuelPrice: number,
  fuelEfficiencyKmPerLiter: number,
) {
  const completedTrips = trips.filter(
    (trip) =>
      trip.status === "CONCLUIDA" &&
      Number(trip.distanceKm ?? 0) > 0 &&
      Number(trip.actualAmount ?? trip.estimatedAmount ?? 0) > 0,
  );

  if (completedTrips.length < MIN_COMPLETED_TRIPS_FOR_INSIGHTS) {
    return [];
  }

  const enrichedTrips = completedTrips
    .map((trip) => {
      const startDate = new Date(trip.startAt);
      const endDate = trip.endAt ? new Date(trip.endAt) : null;
      const estimatedMinutes =
        endDate && !Number.isNaN(endDate.getTime()) && !Number.isNaN(startDate.getTime())
          ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
          : 30;
      const profit = estimateTripProfit({
        trip,
        config,
        fuelPrice,
        fuelEfficiencyKmPerLiter,
        estimatedMinutes,
      });
      return { trip, profit, estimatedMinutes, startDate };
    })
    .filter((item) => !Number.isNaN(item.startDate.getTime()));

  if (enrichedTrips.length < MIN_COMPLETED_TRIPS_FOR_INSIGHTS) {
    return [];
  }

  const insightMessages: string[] = [];

  const hourGroups = [
    { key: "06-10", label: "06h-10h", count: 0, profit: 0 },
    { key: "10-14", label: "10h-14h", count: 0, profit: 0 },
    { key: "14-18", label: "14h-18h", count: 0, profit: 0 },
    { key: "18-22", label: "18h-22h", count: 0, profit: 0 },
    { key: "22-06", label: "22h-06h", count: 0, profit: 0 },
  ];

  enrichedTrips.forEach((item) => {
    const hour = item.startDate.getHours();
    const bucket =
      hour >= 6 && hour < 10
        ? hourGroups[0]
        : hour >= 10 && hour < 14
          ? hourGroups[1]
          : hour >= 14 && hour < 18
            ? hourGroups[2]
            : hour >= 18 && hour < 22
              ? hourGroups[3]
              : hourGroups[4];
    bucket.count += 1;
    bucket.profit += item.profit.profit;
  });

  const bestHourGroup = [...hourGroups]
    .filter((group) => group.count >= 3)
    .sort((a, b) => b.profit / b.count - a.profit / a.count)[0];
  if (bestHourGroup) {
    insightMessages.push(`📈 ${bestHourGroup.label} é seu horário mais lucrativo nas últimas corridas.`);
  }

  const airportTrips = enrichedTrips.filter((item) => {
    const text = `${item.trip.origin} ${item.trip.destination}`.toLowerCase();
    return text.includes("aeroporto") || text.includes("gru") || text.includes("congonhas") || text.includes("galeao");
  });
  const nonAirportTrips = enrichedTrips.filter((item) => !airportTrips.includes(item));
  if (airportTrips.length >= 3 && nonAirportTrips.length >= 3) {
    const airportAvg = airportTrips.reduce((sum, item) => sum + item.profit.profit, 0) / airportTrips.length;
    const nonAirportAvg = nonAirportTrips.reduce((sum, item) => sum + item.profit.profit, 0) / nonAirportTrips.length;
    if (nonAirportAvg > 0 && airportAvg > nonAirportAvg) {
      const gain = Math.round(((airportAvg - nonAirportAvg) / nonAirportAvg) * 100);
      insightMessages.push(`📍 Região de aeroporto gera cerca de ${gain}% mais lucro médio.`);
    }
  }

  const longTrips = enrichedTrips.filter((item) => Number(item.trip.distanceKm ?? 0) >= 12);
  const shortTrips = enrichedTrips.filter((item) => Number(item.trip.distanceKm ?? 0) < 5);
  if (longTrips.length >= 3) {
    const longAvg = longTrips.reduce((sum, item) => sum + item.profit.profitPerKm, 0) / longTrips.length;
    insightMessages.push(`🚗 Corridas acima de 12 km têm lucro médio de ${currency(longAvg)} por km.`);
  }
  if (shortTrips.length >= 3) {
    const shortAvgProfit = shortTrips.reduce((sum, item) => sum + item.profit.profit, 0) / shortTrips.length;
    if (shortAvgProfit < 0) {
      insightMessages.push("⚠ Corridas abaixo de 5 km estão gerando prejuízo médio.");
    }
  }

  return insightMessages.slice(0, 4);
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  sub: {
    color: colors.subtext,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  kpiGrid: {
    gap: spacing.sm,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  insightText: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  projectionLine: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  projectionSub: {
    color: colors.subtext,
    fontSize: 13,
  },
  projectionHint: {
    color: colors.subtext,
    fontSize: 12,
  },
  softCard: {
    backgroundColor: "#F9FCFF",
    borderColor: "#E6EEF6",
    borderWidth: 1,
  },
  kpi: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
});

