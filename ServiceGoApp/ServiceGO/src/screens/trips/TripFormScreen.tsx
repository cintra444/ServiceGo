import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { tripStatusLabels, tripTypeLabels } from "../../constants/labels";
import { colors, spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { customersApi, tripsApi, veiculosApi } from "../../services/api";
import { cleanText, parseNumber } from "../../utils/format";
import type { TripStatus, TripType } from "../../types/api";
import type { TripsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<TripsStackParamList, "TripForm">;

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
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy, hh, min] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0, 0);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export function TripFormScreen({ navigation, route }: Props) {
  const trip = route.params?.trip;
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState<string>(trip?.customerId ? String(trip.customerId) : "");
  const [veiculoId, setVeiculoId] = useState<string>(String(trip?.veiculoId ?? ""));
  const [tripType, setTripType] = useState<TripType>(trip?.tripType ?? "CORRIDA_APP");
  const [status, setStatus] = useState<TripStatus>(trip?.status ?? "AGENDADA");
  const [origin, setOrigin] = useState(trip?.origin ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [tripDetail, setTripDetail] = useState(trip?.appPlatform ?? "");
  const [startAt, setStartAt] = useState(toPtBrDateTime(trip?.startAt) || toPtBrDateTime(new Date().toISOString()));
  const [endAt, setEndAt] = useState(toPtBrDateTime(trip?.endAt));
  const [distanceKm, setDistanceKm] = useState(trip?.distanceKm ? String(trip.distanceKm) : "");
  const [estimatedAmount, setEstimatedAmount] = useState(
    trip?.estimatedAmount ? String(trip.estimatedAmount) : "",
  );
  const [actualAmount, setActualAmount] = useState(trip?.actualAmount ? String(trip.actualAmount) : "");
  const [notes, setNotes] = useState(trip?.notes ?? "");
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [veiculoOptions, setVeiculoOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      if (!session?.token) {
        return;
      }
      try {
        const [customers, veiculos] = await Promise.all([
          customersApi.list(session.token),
          veiculosApi.list(session.token),
        ]);
        setCustomerOptions(customers.map((item) => ({ value: String(item.id), label: item.name })));
        setVeiculoOptions(
          veiculos.map((item) => ({
            value: String(item.id),
            label: `${item.placa} - ${item.modelo}`,
          })),
        );
      } catch {
        Alert.alert("Corrida", "Não foi possível carregar clientes e veículos.");
      }
    };
    loadOptions();
  }, [session?.token]);

  const typeOptions = useMemo(
    () => Object.entries(tripTypeLabels).map(([value, label]) => ({ value, label })),
    [],
  );
  const statusOptions = useMemo(
    () => Object.entries(tripStatusLabels).map(([value, label]) => ({ value, label })),
    [],
  );

  const isAppTrip = tripType === "CORRIDA_APP";
  const tripDetailLabel = useMemo(() => {
    switch (tripType) {
      case "TRASLADO_AEROPORTO":
        return "Aeroporto";
      case "INTERMUNICIPAL":
        return "Cidade de destino";
      case "LOCAL_ESPECIFICO":
        return "Nome do local";
      default:
        return "Plataforma do app";
    }
  }, [tripType]);

  const tripDetailPlaceholder = useMemo(() => {
    switch (tripType) {
      case "TRASLADO_AEROPORTO":
        return "Ex: GRU, Congonhas, Galeão";
      case "INTERMUNICIPAL":
        return "Ex: Campinas, Santos";
      case "LOCAL_ESPECIFICO":
        return "Ex: Hospital, Shopping, Evento";
      default:
        return "Ex: Uber, 99, PopMovie";
    }
  }, [tripType]);

  const submit = async () => {
    if (!session?.token) {
      return;
    }
    const veiculoIdNumber = Number(veiculoId);
    if (!origin.trim() || !destination.trim() || !veiculoIdNumber) {
      Alert.alert("Corrida", "Preencha origem, destino e veículo.");
      return;
    }
    if (!isAppTrip && !customerId) {
      Alert.alert("Corrida", "Para corrida fora de app, selecione um cliente.");
      return;
    }
    const startAtIso = toIsoFromPtBr(startAt);
    const endAtIso = endAt.trim() ? toIsoFromPtBr(endAt) : undefined;
    if (!startAtIso) {
      Alert.alert("Corrida", "Início inválido. Use DD/MM/AAAA HH:mm.");
      return;
    }
    if (endAt.trim() && !endAtIso) {
      Alert.alert("Corrida", "Fim inválido. Use DD/MM/AAAA HH:mm.");
      return;
    }
    const detailText = cleanText(tripDetail);
    const notesText = cleanText(notes);
    const contextualNotes =
      !isAppTrip && detailText ? cleanText(`${tripDetailLabel}: ${detailText}${notesText ? ` | ${notesText}` : ""}`) : notesText;

    try {
      setSaving(true);
      const payload = {
        customerId: customerId ? Number(customerId) : null,
        veiculoId: veiculoIdNumber,
        tripType,
        status,
        origin: origin.trim(),
        destination: destination.trim(),
        appPlatform: isAppTrip ? detailText : undefined,
        startAt: startAtIso,
        endAt: endAtIso,
        distanceKm: parseNumber(distanceKm),
        estimatedAmount: parseNumber(estimatedAmount),
        actualAmount: parseNumber(actualAmount),
        notes: contextualNotes,
      };
      if (trip?.id) {
        await tripsApi.update(session.token, trip.id, payload);
      } else {
        await tripsApi.create(session.token, payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Corrida", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SGCard>
        <SGInput label="Origem" value={origin} onChangeText={setOrigin} />
        <SGInput label="Destino" value={destination} onChangeText={setDestination} />
        <ChipSelect label="Tipo de corrida" value={tripType} options={typeOptions} onChange={(v) => setTripType(v as TripType)} />
        <ChipSelect label="Status" value={status} options={statusOptions} onChange={(v) => setStatus(v as TripStatus)} />
        {!isAppTrip ? (
          <ChipSelect label="Cliente" value={customerId} options={customerOptions} onChange={setCustomerId} />
        ) : null}
        <ChipSelect label="Veículo" value={veiculoId} options={veiculoOptions} onChange={setVeiculoId} />
        <SGInput
          label={tripDetailLabel}
          value={tripDetail ?? ""}
          onChangeText={setTripDetail}
          placeholder={tripDetailPlaceholder}
        />
        <SGInput
          label="Início"
          value={startAt}
          onChangeText={setStartAt}
          placeholder="Ex: 07/03/2026 14:30"
          keyboardType="numbers-and-punctuation"
        />
        <SGInput
          label="Fim (opcional)"
          value={endAt ?? ""}
          onChangeText={setEndAt}
          placeholder="Ex: 07/03/2026 15:40"
          keyboardType="numbers-and-punctuation"
        />
        <SGInput
          label="Distância km"
          value={distanceKm}
          onChangeText={setDistanceKm}
          keyboardType="decimal-pad"
          placeholder="Ex: 12,5"
        />
        <SGInput
          label="Valor estimado"
          value={estimatedAmount}
          onChangeText={setEstimatedAmount}
          keyboardType="decimal-pad"
          placeholder="Ex: 85,00"
        />
        <SGInput
          label="Valor real"
          value={actualAmount}
          onChangeText={setActualAmount}
          keyboardType="decimal-pad"
          placeholder="Ex: 92,50"
        />
        <SGInput label="Observações" value={notes ?? ""} onChangeText={setNotes} multiline />
        <SGButton
          label={trip ? "Atualizar corrida" : "Criar corrida"}
          onPress={submit}
          loading={saving}
          icon={<Ionicons name={trip ? "create-outline" : "checkmark-circle-outline"} size={18} color="#fff" />}
        />
      </SGCard>

      <SGCard>
        {!isAppTrip && customerOptions.length === 0 ? (
          <View style={styles.supportRow}>
            <Text style={styles.supportText}>Nenhum cliente disponível para este tipo de corrida.</Text>
            <SGButton
              label="Cadastrar cliente"
              onPress={() => navigation.getParent()?.navigate("ClientesTab" as never)}
              variant="secondary"
              icon={<Ionicons name="person-add-outline" size={18} color="#fff" />}
            />
          </View>
        ) : null}

        {veiculoOptions.length === 0 ? (
          <View style={styles.supportRow}>
            <View style={styles.supportHint}>
              <Ionicons name="car-sport-outline" size={16} color={colors.subtext} />
              <Text style={styles.supportText}>Sem veículo cadastrado.</Text>
            </View>
            <SGButton
              label="Ir para Veículos"
              onPress={() => navigation.getParent()?.navigate("VeiculosTab" as never)}
              variant="secondary"
              icon={<Ionicons name="arrow-forward-circle-outline" size={18} color="#fff" />}
            />
          </View>
        ) : null}

        {isAppTrip ? (
          <Text style={styles.supportText}>Para corridas de app, cliente pode ficar sem vínculo.</Text>
        ) : null}
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  supportRow: {
    gap: spacing.sm,
  },
  supportHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  supportText: {
    color: colors.subtext,
    fontSize: 12,
  },
});

