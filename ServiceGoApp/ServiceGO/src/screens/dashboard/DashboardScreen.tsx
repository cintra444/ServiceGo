import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGButton } from "../../components/ui/SGButton";
import { colors, spacing } from "../../constants/theme";
import { paymentsApi, tripsApi, expensesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { currency, dateOnly } from "../../utils/format";

interface DashboardState {
  corridasHoje: number;
  corridasEmAndamento: number;
  receitaMes: number;
  despesasMes: number;
}

export function DashboardScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardState>({
    corridasHoje: 0,
    corridasEmAndamento: 0,
    receitaMes: 0,
    despesasMes: 0,
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
      setData({ corridasHoje, corridasEmAndamento, receitaMes, despesasMes });
    } catch {
      Alert.alert("Painel", "Não foi possível carregar os indicadores.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const lucroMes = useMemo(() => data.receitaMes - data.despesasMes, [data.despesasMes, data.receitaMes]);

  return (
    <Screen>
      <Text style={styles.header}>Painel do motorista</Text>
      <Text style={styles.sub}>Atualizado em {dateOnly(new Date().toISOString())}</Text>
      <Image source={require("../../assets/ServiceGO.png")} style={styles.brandImage} resizeMode="contain" />
      {loading ? <ActivityIndicator color={colors.primary} /> : null}

      <View style={styles.kpiGrid}>
        <SGCard title="Corridas hoje">
          <Text style={styles.kpi}>{data.corridasHoje}</Text>
        </SGCard>
        <SGCard title="Em andamento">
          <Text style={styles.kpi}>{data.corridasEmAndamento}</Text>
        </SGCard>
        <SGCard title="Receita do mês">
          <Text style={styles.kpi}>{currency(data.receitaMes)}</Text>
        </SGCard>
        <SGCard title="Despesas do mês">
          <Text style={styles.kpi}>{currency(data.despesasMes)}</Text>
        </SGCard>
      </View>

      <SGCard title="Saldo estimado do mês">
        <Text style={[styles.kpi, { color: lucroMes >= 0 ? colors.success : colors.danger }]}>
          {currency(lucroMes)}
        </Text>
      </SGCard>

      <SGButton label="Atualizar painel" onPress={load} />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  brandImage: {
    width: "100%",
    height: 180,
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  kpiGrid: {
    gap: spacing.sm,
  },
  kpi: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
});

