import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGButton } from "../../components/ui/SGButton";
import { SGCard } from "../../components/ui/SGCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { SGInput } from "../../components/ui/SGInput";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { colors, spacing } from "../../constants/theme";
import { expenseCategoryLabels, paymentMethodLabels, paymentStatusLabels } from "../../constants/labels";
import { expensesApi, paymentsApi, relatoriosApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { currency, dateTime } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { Expense, Payment, RelatorioFinanceiro } from "../../types/api";

type Nav = NativeStackNavigationProp<FinanceStackParamList, "FinanceHome">;

export function FinanceScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [veiculoId, setVeiculoId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      const [p, e] = await Promise.all([paymentsApi.list(session.token), expensesApi.list(session.token)]);
      setPayments(p);
      setExpenses(e);
    } catch {
      Alert.alert("Financeiro", "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const totalReceitas = payments.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const totalDespesas = expenses.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    return { totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas };
  }, [expenses, payments]);

  const removePayment = async (id: number) => {
    if (!session?.token) {
      return;
    }
    await paymentsApi.remove(session.token, id);
    await load();
  };

  const removeExpense = async (id: number) => {
    if (!session?.token) {
      return;
    }
    await expensesApi.remove(session.token, id);
    await load();
  };

  const loadRelatorioFinanceiro = async () => {
    if (!session?.token) {
      return;
    }
    const usuarioIdValue = session.userId;
    const veiculoIdValue = Number(veiculoId);

    if (!usuarioIdValue) {
      Alert.alert("Relatório", "Não foi possível identificar seu usuário na sessão.");
      return;
    }
    if (veiculoId.trim() && (!veiculoIdValue || !Number.isInteger(veiculoIdValue))) {
      Alert.alert("Relatório", "Veículo ID inválido.");
      return;
    }
    if (inicio.trim() && Number.isNaN(new Date(inicio).getTime())) {
      Alert.alert("Relatório", "Campo início inválido. Use ISO_OFFSET_DATE_TIME.");
      return;
    }
    if (fim.trim() && Number.isNaN(new Date(fim).getTime())) {
      Alert.alert("Relatório", "Campo fim inválido. Use ISO_OFFSET_DATE_TIME.");
      return;
    }

    try {
      setLoadingRelatorio(true);
      const data = await relatoriosApi.financeiro(session.token, {
        usuarioId: usuarioIdValue,
        veiculoId: veiculoId.trim() ? veiculoIdValue : undefined,
        inicio: inicio.trim() ? inicio.trim() : undefined,
        fim: fim.trim() ? fim.trim() : undefined,
      });
      setRelatorio(data);
    } catch {
      Alert.alert("Relatório", "Não foi possível carregar o relatório financeiro.");
    } finally {
      setLoadingRelatorio(false);
    }
  };

  return (
    <Screen>
      <SGCard title="Resumo financeiro">
        <Text style={styles.line}>Receitas: {currency(totals.totalReceitas)}</Text>
        <Text style={styles.line}>Despesas: {currency(totals.totalDespesas)}</Text>
        <Text style={[styles.line, { color: totals.saldo >= 0 ? colors.success : colors.danger }]}>
          Saldo: {currency(totals.saldo)}
        </Text>
      </SGCard>

      <View style={styles.row}>
        <SGButton label="Novo pagamento" onPress={() => navigation.navigate("PaymentForm")} />
        <SGButton label="Nova despesa" onPress={() => navigation.navigate("ExpenseForm")} />
      </View>
      <SGButton label="Atualizar financeiro" onPress={load} loading={loading} variant="secondary" />

      <SGCard title="Relatório financeiro consolidado" subtitle="GET /api/relatorios/financeiro">
        <Text style={styles.line}>Usuário da sessão: {session.userId ?? "-"}</Text>
        <SGInput
          label="Veículo ID (opcional)"
          value={veiculoId}
          onChangeText={setVeiculoId}
          keyboardType="number-pad"
        />
        <SGInput
          label="Início ISO_OFFSET_DATE_TIME (opcional)"
          value={inicio}
          onChangeText={setInicio}
          placeholder="2026-03-01T00:00:00-03:00"
          autoCapitalize="none"
        />
        <SGInput
          label="Fim ISO_OFFSET_DATE_TIME (opcional)"
          value={fim}
          onChangeText={setFim}
          placeholder="2026-03-31T23:59:59-03:00"
          autoCapitalize="none"
        />
        <SGButton label="Carregar relatório" onPress={loadRelatorioFinanceiro} loading={loadingRelatorio} />

        {relatorio ? (
          <View style={styles.report}>
            <Text style={styles.line}>
              Período: {dateTime(relatorio.periodoInicio)} até {dateTime(relatorio.periodoFim)}
            </Text>
            <Text style={styles.line}>Total de corridas: {relatorio.totalCorridas}</Text>
            <Text style={styles.line}>Km total: {Number(relatorio.kmTotal ?? 0).toFixed(2)} km</Text>
            <Text style={styles.line}>Receita total: {currency(relatorio.receitaTotal)}</Text>
            <Text style={styles.line}>Custos variáveis: {currency(relatorio.custosVariaveisTotal)}</Text>
            <Text style={styles.line}>Depreciação no período: {currency(relatorio.depreciacaoTotalPeriodo)}</Text>
            <Text style={styles.line}>Custo operacional total: {currency(relatorio.custoOperacionalTotal)}</Text>
            <Text style={styles.line}>Custo operacional por km: {currency(relatorio.custoOperacionalPorKm)}</Text>
            <Text style={[styles.line, { color: relatorio.lucroTotal >= 0 ? colors.success : colors.danger }]}>
              Lucro total: {currency(relatorio.lucroTotal)}
            </Text>
            <Text style={styles.line}>Lucro por km: {currency(relatorio.lucroPorKm)}</Text>
            <Text style={styles.line}>Lucro por corrida: {currency(relatorio.lucroPorCorrida)}</Text>
            <Text style={styles.line}>Lucro por dia: {currency(relatorio.lucroPorDia)}</Text>
            <Text style={styles.line}>Lucro por mês: {currency(relatorio.lucroPorMes)}</Text>
          </View>
        ) : (
          <EmptyState message="Carregue o relatório para exibir os indicadores consolidados." />
        )}
      </SGCard>

      <SGCard title="Pagamentos">
        {payments.length === 0 ? <EmptyState message="Sem pagamentos." /> : null}
        {payments.map((payment) => (
          <SGCard
            key={`pay-${payment.id}`}
            title={`${currency(payment.amount)} - ${paymentMethodLabels[payment.method]}`}
            subtitle={dateTime(payment.paidAt ?? payment.dueAt)}
          >
            <StatusBadge label={paymentStatusLabels[payment.status]} status={payment.status} />
            <Text style={styles.line}>Corrida ID: {payment.tripId ?? "-"}</Text>
            <Text style={styles.line}>Cliente ID: {payment.customerId ?? "-"}</Text>
            <Text style={styles.line}>Parcial: {payment.pagamentoParcial ? "Sim" : "Não"}</Text>
            <View style={styles.row}>
              <SGButton label="Editar" onPress={() => navigation.navigate("PaymentForm", { payment })} />
              <SGButton label="Excluir" variant="danger" onPress={() => removePayment(payment.id)} />
            </View>
          </SGCard>
        ))}
      </SGCard>

      <SGCard title="Despesas">
        {expenses.length === 0 ? <EmptyState message="Sem despesas." /> : null}
        {expenses.map((expense) => (
          <SGCard
            key={`exp-${expense.id}`}
            title={`${currency(expense.amount)} - ${expenseCategoryLabels[expense.category]}`}
            subtitle={dateTime(expense.occurredAt)}
          >
            <Text style={styles.line}>Veículo: {expense.veiculoPlaca ?? `ID ${expense.veiculoId}`}</Text>
            <Text style={styles.line}>Corrida ID: {expense.tripId ?? "-"}</Text>
            <Text style={styles.line}>Descrição: {expense.description ?? "-"}</Text>
            <View style={styles.row}>
              <SGButton label="Editar" onPress={() => navigation.navigate("ExpenseForm", { expense })} />
              <SGButton label="Excluir" variant="danger" onPress={() => removeExpense(expense.id)} />
            </View>
          </SGCard>
        ))}
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: {
    color: colors.subtext,
    fontSize: 13,
  },
  report: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
