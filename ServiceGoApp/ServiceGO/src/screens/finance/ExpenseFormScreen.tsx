import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { expenseCategoryLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { expensesApi } from "../../services/api";
import { cleanText, parseNumber } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { ExpenseCategory } from "../../types/api";

type Props = NativeStackScreenProps<FinanceStackParamList, "ExpenseForm">;

export function ExpenseFormScreen({ navigation, route }: Props) {
  const expense = route.params?.expense;
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tripId, setTripId] = useState(expense?.tripId ? String(expense.tripId) : "");
  const [veiculoId, setVeiculoId] = useState(String(expense?.veiculoId ?? ""));
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "COMBUSTIVEL");
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [occurredAt, setOccurredAt] = useState(expense?.occurredAt ?? new Date().toISOString());

  const options = useMemo(
    () => Object.entries(expenseCategoryLabels).map(([value, label]) => ({ value, label })),
    [],
  );

  const submit = async () => {
    if (!session?.token) {
      return;
    }
    const amountValue = parseNumber(amount);
    const veiculoIdValue = Number(veiculoId);
    if (!amountValue || !veiculoIdValue) {
      Alert.alert("Despesa", "Informe veículo e valor válido.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        tripId: tripId ? Number(tripId) : null,
        veiculoId: veiculoIdValue,
        category,
        amount: amountValue,
        description: cleanText(description),
        occurredAt: occurredAt.trim(),
      };
      if (expense?.id) {
        await expensesApi.update(session.token, expense.id, payload);
      } else {
        await expensesApi.create(session.token, payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Despesa", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SGCard subtitle="Data em ISO: 2026-03-03T10:30:00-03:00">
        <SGInput label="ID da corrida (opcional)" value={tripId} onChangeText={setTripId} keyboardType="number-pad" />
        <SGInput label="ID do veículo" value={veiculoId} onChangeText={setVeiculoId} keyboardType="number-pad" />
        <ChipSelect label="Categoria" value={category} options={options} onChange={(v) => setCategory(v as ExpenseCategory)} />
        <SGInput label="Valor" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <SGInput label="Descrição" value={description ?? ""} onChangeText={setDescription} multiline />
        <SGInput label="Ocorrida em (ISO)" value={occurredAt} onChangeText={setOccurredAt} />
        <SGButton label={expense ? "Atualizar despesa" : "Criar despesa"} onPress={submit} loading={saving} />
      </SGCard>
    </Screen>
  );
}
