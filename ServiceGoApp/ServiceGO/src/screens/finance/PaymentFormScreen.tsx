import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { paymentMethodLabels, paymentStatusLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { paymentsApi } from "../../services/api";
import { cleanText, parseNumber } from "../../utils/format";
import type { FinanceStackParamList } from "../../navigation/types";
import type { PaymentMethod, PaymentStatus } from "../../types/api";

type Props = NativeStackScreenProps<FinanceStackParamList, "PaymentForm">;

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
  const [paidAt, setPaidAt] = useState(payment?.paidAt ?? "");
  const [dueAt, setDueAt] = useState(payment?.dueAt ?? "");
  const [referenceCode, setReferenceCode] = useState(payment?.referenceCode ?? "");
  const [notes, setNotes] = useState(payment?.notes ?? "");

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
        paidAt: cleanText(paidAt),
        dueAt: cleanText(dueAt),
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
      <SGCard subtitle="Datas em ISO: 2026-03-03T10:30:00-03:00">
        <SGInput label="ID da corrida (opcional)" value={tripId} onChangeText={setTripId} keyboardType="number-pad" />
        <SGInput label="ID do cliente (opcional)" value={customerId} onChangeText={setCustomerId} keyboardType="number-pad" />
        <ChipSelect label="Método" value={method} options={methodOptions} onChange={(v) => setMethod(v as PaymentMethod)} />
        <ChipSelect label="Status" value={status} options={statusOptions} onChange={(v) => setStatus(v as PaymentStatus)} />
        <SGInput label="Valor" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
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
        />
        <SGInput label="Pago em (ISO)" value={paidAt ?? ""} onChangeText={setPaidAt} />
        <SGInput label="Vence em (ISO)" value={dueAt ?? ""} onChangeText={setDueAt} />
        <SGInput label="Código de referência" value={referenceCode ?? ""} onChangeText={setReferenceCode} />
        <SGInput label="Observações" value={notes ?? ""} onChangeText={setNotes} multiline />
        <SGButton label={payment ? "Atualizar pagamento" : "Criar pagamento"} onPress={submit} loading={saving} />
      </SGCard>
    </Screen>
  );
}
