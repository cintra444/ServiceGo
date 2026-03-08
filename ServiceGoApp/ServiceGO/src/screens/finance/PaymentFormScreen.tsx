import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { paymentMethodLabels, paymentStatusLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { customersApi, paymentsApi, tripsApi } from "../../services/api";
import { cleanText, parseNumber } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { PaymentMethod, PaymentStatus } from "../../types/api";

type Props = NativeStackScreenProps<FinanceStackParamList, "PaymentForm">;

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

export function PaymentFormScreen({ navigation, route }: Props) {
  const payment = route.params?.payment;
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tripId, setTripId] = useState(payment?.tripId ? String(payment.tripId) : "");
  const [customerId, setCustomerId] = useState(payment?.customerId ? String(payment.customerId) : "");
  const [method, setMethod] = useState<PaymentMethod>(payment?.method ?? "PIX");
  const [status, setStatus] = useState<PaymentStatus>(payment?.status ?? "PENDENTE");
  const [amount, setAmount] = useState(payment?.amount ? String(payment.amount) : "");
  const [pagamentoParcial, setPagamentoParcial] = useState(payment?.pagamentoParcial ? "true" : "false");
  const [numeroParcela, setNumeroParcela] = useState(
    payment?.numeroParcela ? String(payment.numeroParcela) : "",
  );
  const [paidAt, setPaidAt] = useState(toPtBrDateTime(payment?.paidAt));
  const [dueAt, setDueAt] = useState(toPtBrDateTime(payment?.dueAt));
  const [referenceCode, setReferenceCode] = useState(payment?.referenceCode ?? "");
  const [notes, setNotes] = useState(payment?.notes ?? "");
  const [tripOptions, setTripOptions] = useState<{ value: string; label: string }[]>([]);
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      if (!session?.token) {
        return;
      }
      try {
        const [trips, customers] = await Promise.all([
          tripsApi.list(session.token),
          customersApi.list(session.token),
        ]);
        setTripOptions(
          trips.map((item) => ({
            value: String(item.id),
            label: `${item.origin} -> ${item.destination}`,
          })),
        );
        setCustomerOptions(customers.map((item) => ({ value: String(item.id), label: item.name })));
      } catch {
        Alert.alert("Pagamento", "Não foi possível carregar corridas e clientes.");
      }
    };
    loadOptions();
  }, [session?.token]);

  const methodOptions = useMemo(
    () => Object.entries(paymentMethodLabels).map(([value, label]) => ({ value, label })),
    [],
  );
  const statusOptions = useMemo(
    () => Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label })),
    [],
  );

  const submit = async () => {
    if (!session?.token) {
      return;
    }
    const amountValue = parseNumber(amount);
    if (!amountValue) {
      Alert.alert("Pagamento", "Informe um valor válido.");
      return;
    }
    const paidAtIso = toIsoFromPtBr(paidAt);
    const dueAtIso = toIsoFromPtBr(dueAt);
    if (paidAt.trim() && !paidAtIso) {
      Alert.alert("Pagamento", "Data de pagamento inválida. Use DD/MM/AAAA HH:mm.");
      return;
    }
    if (dueAt.trim() && !dueAtIso) {
      Alert.alert("Pagamento", "Data de vencimento inválida. Use DD/MM/AAAA HH:mm.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        tripId: tripId ? Number(tripId) : null,
        customerId: customerId ? Number(customerId) : null,
        method,
        status,
        amount: amountValue,
        pagamentoParcial: pagamentoParcial === "true",
        numeroParcela: parseNumber(numeroParcela),
        paidAt: paidAtIso,
        dueAt: dueAtIso,
        referenceCode: cleanText(referenceCode),
        notes: cleanText(notes),
      };
      if (payment?.id) {
        await paymentsApi.update(session.token, payment.id, payload);
      } else {
        await paymentsApi.create(session.token, payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Pagamento", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SGCard>
        <ChipSelect label="Corrida (opcional)" value={tripId} options={[{ value: "", label: "Nenhuma" }, ...tripOptions]} onChange={setTripId} />
        <ChipSelect
          label="Cliente (opcional)"
          value={customerId}
          options={[{ value: "", label: "Nenhum" }, ...customerOptions]}
          onChange={setCustomerId}
        />
        <ChipSelect label="Método" value={method} options={methodOptions} onChange={(v) => setMethod(v as PaymentMethod)} />
        <ChipSelect label="Status" value={status} options={statusOptions} onChange={(v) => setStatus(v as PaymentStatus)} />
        <SGInput label="Valor" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Ex: 85,00" />
        <ChipSelect
          label="Pagamento parcial"
          value={pagamentoParcial}
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
          onChange={setPagamentoParcial}
        />
        <SGInput
          label="Número da parcela"
          value={numeroParcela}
          onChangeText={setNumeroParcela}
          keyboardType="number-pad"
          placeholder="Ex: 1"
        />
        <SGInput
          label="Pago em"
          value={paidAt ?? ""}
          onChangeText={setPaidAt}
          placeholder="Ex: 08/03/2026 14:20"
          keyboardType="numbers-and-punctuation"
        />
        <SGInput
          label="Vence em"
          value={dueAt ?? ""}
          onChangeText={setDueAt}
          placeholder="Ex: 10/03/2026 18:00"
          keyboardType="numbers-and-punctuation"
        />
        <SGInput label="Código de referência" value={referenceCode ?? ""} onChangeText={setReferenceCode} placeholder="Ex: PIX12345" />
        <SGInput label="Observações" value={notes ?? ""} onChangeText={setNotes} multiline />
        <SGButton
          label={payment ? "Atualizar pagamento" : "Criar pagamento"}
          onPress={submit}
          loading={saving}
          icon={<Ionicons name={payment ? "create-outline" : "wallet-outline"} size={18} color="#fff" />}
        />
      </SGCard>
    </Screen>
  );
}
