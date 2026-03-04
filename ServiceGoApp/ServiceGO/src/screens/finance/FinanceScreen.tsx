import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGButton } from "../../components/ui/SGButton";
import { SGCard } from "../../components/ui/SGCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { colors, spacing } from "../../constants/theme";
import { expenseCategoryLabels, paymentMethodLabels, paymentStatusLabels } from "../../constants/labels";
import { expensesApi, paymentsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { currency, dateTime } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { Expense, Payment } from "../../types/api";

type Nav = NativeStackNavigationProp<FinanceStackParamList, "FinanceHome">;

export function FinanceScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

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
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
