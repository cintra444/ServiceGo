import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { expenseCategoryLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { expensesApi, tripsApi, veiculosApi } from "../../services/api";
import { cleanText, parseNumber } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { ExpenseCategory, Veiculo } from "../../types/api";

type Props = NativeStackScreenProps<FinanceStackParamList, "ExpenseForm">;

const toPtBrDateTime = (iso?: string | null) => {
  if (!iso) {
    return "";
  }
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return "";
  }
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toIsoFromPtBr = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy, hh, min] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0, 0);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export function ExpenseFormScreen({ navigation, route }: Props) {
  const expense = route.params?.expense;
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tripId, setTripId] = useState(expense?.tripId ? String(expense.tripId) : "");
  const [veiculoId, setVeiculoId] = useState(String(expense?.veiculoId ?? ""));
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "COMBUSTIVEL");
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [occurredAt, setOccurredAt] = useState(
    toPtBrDateTime(expense?.occurredAt) || toPtBrDateTime(new Date().toISOString()),
  );
  const [tripOptions, setTripOptions] = useState<{ value: string; label: string }[]>([]);
  const [veiculoOptions, setVeiculoOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      if (!session?.token) {
        return;
      }
      try {
        const [trips, veiculos] = await Promise.all([
          tripsApi.list(session.token),
          veiculosApi.list(session.token),
        ]);
        setTripOptions(
          trips.map((item) => ({
            value: String(item.id),
            label: `${item.origin} -> ${item.destination}`,
          })),
        );
        setVeiculoOptions(
          veiculos.map((item: Veiculo) => ({
            value: String(item.id),
            label: `${item.placa} - ${item.modelo}`,
          })),
        );
      } catch {
        Alert.alert("Despesa", "Não foi possível carregar corridas e veículos.");
      }
    };
    loadOptions();
  }, [session?.token]);

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
    const occurredAtIso = toIsoFromPtBr(occurredAt);
    if (!occurredAtIso) {
      Alert.alert("Despesa", "Data inválida. Use DD/MM/AAAA HH:mm.");
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
        occurredAt: occurredAtIso,
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
      <SGCard>
        <ChipSelect
          label="Corrida (opcional)"
          value={tripId}
          options={[{ value: "", label: "Nenhuma" }, ...tripOptions]}
          onChange={setTripId}
        />
        <ChipSelect label="Veículo" value={veiculoId} options={veiculoOptions} onChange={setVeiculoId} />
        <ChipSelect label="Categoria" value={category} options={options} onChange={(v) => setCategory(v as ExpenseCategory)} />
        <SGInput label="Valor" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Ex: 55,00" />
        <SGInput label="Descrição" value={description ?? ""} onChangeText={setDescription} multiline placeholder="Ex: Abastecimento, pedágio, manutenção" />
        <SGInput
          label="Data da despesa"
          value={occurredAt}
          onChangeText={setOccurredAt}
          placeholder="Ex: 08/03/2026 09:15"
          keyboardType="numbers-and-punctuation"
        />
        <SGButton
          label={expense ? "Atualizar despesa" : "Criar despesa"}
          onPress={submit}
          loading={saving}
          icon={<Ionicons name={expense ? "create-outline" : "receipt-outline"} size={18} color="#fff" />}
        />
      </SGCard>
    </Screen>
  );
}
