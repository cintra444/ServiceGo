import React, { useEffect, useMemo, useState } from "react";
import { Alert, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { tripStatusLabels, tripTypeLabels } from "../../constants/labels";
import { useAuth } from "../../context/AuthContext";
import { customersApi, tripsApi, veiculosApi } from "../../services/api";
import { cleanText, parseNumber } from "../../utils/format";
import type { TripStatus, TripType } from "../../types/api";
import type { TripsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<TripsStackParamList, "TripForm">;

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
  const [appPlatform, setAppPlatform] = useState(trip?.appPlatform ?? "");
  const [startAt, setStartAt] = useState(trip?.startAt ?? new Date().toISOString());
  const [endAt, setEndAt] = useState(trip?.endAt ?? "");
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
      const [customers, veiculos] = await Promise.all([
        customersApi.list(session.token),
        veiculosApi.list(session.token),
      ]);
      setCustomerOptions(customers.map((item) => ({ value: String(item.id), label: item.name })));
      setVeiculoOptions(
        veiculos.map((item) => ({
          value: String(item.id),
          label: `${item.modelo} (${item.placa})`,
        })),
      );
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

  const submit = async () => {
    if (!session?.token) {
      return;
    }
    const veiculoIdNumber = Number(veiculoId);
    if (!origin.trim() || !destination.trim() || !veiculoIdNumber) {
      Alert.alert("Corrida", "Preencha origem, destino e veículo.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        customerId: customerId ? Number(customerId) : null,
        veiculoId: veiculoIdNumber,
        tripType,
        status,
        origin: origin.trim(),
        destination: destination.trim(),
        appPlatform: cleanText(appPlatform),
        startAt: startAt.trim(),
        endAt: cleanText(endAt),
        distanceKm: parseNumber(distanceKm),
        estimatedAmount: parseNumber(estimatedAmount),
        actualAmount: parseNumber(actualAmount),
        notes: cleanText(notes),
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
      <SGCard subtitle="Campos de data devem ser ISO, ex: 2026-03-03T10:30:00-03:00">
        <SGInput label="Origem" value={origin} onChangeText={setOrigin} />
        <SGInput label="Destino" value={destination} onChangeText={setDestination} />
        <ChipSelect label="Tipo de corrida" value={tripType} options={typeOptions} onChange={(v) => setTripType(v as TripType)} />
        <ChipSelect label="Status" value={status} options={statusOptions} onChange={(v) => setStatus(v as TripStatus)} />
        <ChipSelect label="Cliente (opcional)" value={customerId} options={customerOptions} onChange={setCustomerId} />
        <ChipSelect label="Veículo" value={veiculoId} options={veiculoOptions} onChange={setVeiculoId} />
        <SGInput label="Plataforma app" value={appPlatform ?? ""} onChangeText={setAppPlatform} />
        <SGInput label="Início (ISO)" value={startAt} onChangeText={setStartAt} />
        <SGInput label="Fim (ISO opcional)" value={endAt ?? ""} onChangeText={setEndAt} />
        <SGInput label="Distância km" value={distanceKm} onChangeText={setDistanceKm} keyboardType="decimal-pad" />
        <SGInput label="Valor estimado" value={estimatedAmount} onChangeText={setEstimatedAmount} keyboardType="decimal-pad" />
        <SGInput label="Valor real" value={actualAmount} onChangeText={setActualAmount} keyboardType="decimal-pad" />
        <SGInput label="Observações" value={notes ?? ""} onChangeText={setNotes} multiline />
        <SGButton label={trip ? "Atualizar corrida" : "Criar corrida"} onPress={submit} loading={saving} />
      </SGCard>
      <Text>Se cliente/veículo não aparecer, cadastre primeiro nas abas correspondentes.</Text>
    </Screen>
  );
}

