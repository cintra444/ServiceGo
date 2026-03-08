import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGButton } from "../../components/ui/SGButton";
import { SGCard } from "../../components/ui/SGCard";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { SGInput } from "../../components/ui/SGInput";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { colors, spacing } from "../../constants/theme";
import { expenseCategoryLabels, paymentMethodLabels, paymentStatusLabels } from "../../constants/labels";
import { expensesApi, paymentsApi, relatoriosApi, veiculosApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { currency, dateTime } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { Expense, Payment, RelatorioFinanceiro, Veiculo } from "../../types/api";

type Nav = NativeStackNavigationProp<FinanceStackParamList, "FinanceHome">;

const toOffsetIso = (dateValue: string, endOfDay = false) => {
  const normalized = dateValue.trim();
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const hours = endOfDay ? 23 : 0;
  const minutes = endOfDay ? 59 : 0;
  const seconds = endOfDay ? 59 : 0;
  const localDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes, seconds, 0);
  if (Number.isNaN(localDate.getTime())) {
    return undefined;
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absoluteOffset / 60));
  const offsetRemainder = pad(absoluteOffset % 60);
  return `${yyyy}-${mm}-${dd}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}${sign}${offsetHours}:${offsetRemainder}`;
};

export function FinanceScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
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
      const [p, e, v] = await Promise.all([
        paymentsApi.list(session.token),
        expensesApi.list(session.token),
        veiculosApi.list(session.token),
      ]);
      setPayments(p);
      setExpenses(e);
      setVeiculos(v);
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
    const inicioIso = inicio.trim() ? toOffsetIso(inicio) : undefined;
    const fimIso = fim.trim() ? toOffsetIso(fim, true) : undefined;
    if (inicio.trim() && !inicioIso) {
      Alert.alert("Relatório", "Data inicial inválida. Use DD/MM/AAAA.");
      return;
    }
    if (fim.trim() && !fimIso) {
      Alert.alert("Relatório", "Data final inválida. Use DD/MM/AAAA.");
      return;
    }

    try {
      setLoadingRelatorio(true);
      const data = await relatoriosApi.financeiro(session.token, {
        usuarioId: usuarioIdValue,
        veiculoId: veiculoId.trim() ? veiculoIdValue : undefined,
        inicio: inicioIso,
        fim: fimIso,
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

      <View style={styles.actions}>
        <SGButton
          label="Novo pagamento"
          onPress={() => navigation.navigate("PaymentForm")}
          variant="secondary"
          icon={<Ionicons name="wallet-outline" size={18} color="#fff" />}
        />
        <SGButton
          label="Nova despesa"
          onPress={() => navigation.navigate("ExpenseForm")}
          variant="secondary"
          icon={<Ionicons name="receipt-outline" size={18} color="#fff" />}
        />
      </View>
      <SGButton
        label="Atualizar financeiro"
        onPress={load}
        loading={loading}
        variant="secondary"
        icon={<Ionicons name="refresh-circle-outline" size={18} color="#fff" />}
      />

      <SGCard title="Relatório financeiro">
        <ChipSelect
          label="Veículo"
          value={veiculoId}
          onChange={setVeiculoId}
          options={[
            { value: "", label: "Todos" },
            ...veiculos.map((item) => ({
              value: String(item.id),
              label: `${item.placa} - ${item.modelo}`,
            })),
          ]}
        />
        <SGInput
          label="Data inicial (opcional)"
          value={inicio}
          onChangeText={setInicio}
          placeholder="Ex: 01/03/2026"
          keyboardType="numbers-and-punctuation"
        />
        <SGInput
          label="Data final (opcional)"
          value={fim}
          onChangeText={setFim}
          placeholder="Ex: 31/03/2026"
          keyboardType="numbers-and-punctuation"
        />
        <SGButton
          label="Gerar relatório"
          onPress={loadRelatorioFinanceiro}
          loading={loadingRelatorio}
          icon={<Ionicons name="bar-chart-outline" size={18} color="#fff" />}
        />

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
            <Text style={styles.line}>Corrida vinculada: {payment.tripId ? `#${payment.tripId}` : "-"}</Text>
            <Text style={styles.line}>Cliente: {payment.customerId ? `#${payment.customerId}` : "-"}</Text>
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
            <Text style={styles.line}>Corrida vinculada: {expense.tripId ? `#${expense.tripId}` : "-"}</Text>
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
  actions: {
    marginTop: spacing.xl + spacing.md,
    width: "100%",
    gap: spacing.sm,
  },
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
