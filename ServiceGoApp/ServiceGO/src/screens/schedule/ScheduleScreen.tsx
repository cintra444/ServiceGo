import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { agendamentoStatusLabels } from "../../constants/labels";
import { colors, spacing } from "../../constants/theme";
import { agendamentosApi, tripsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { addEventToDeviceCalendar } from "../../utils/calendar";
import { dateTime } from "../../utils/format";
import type { Agendamento, StatusAgendamento } from "../../types/api";

const toPtBrDateTime = (iso?: string | null) => {
  if (!iso) {
    return "";
  }
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
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

export function ScheduleScreen() {
  const { session } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [tripOptions, setTripOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripId, setTripId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [inicioEm, setInicioEm] = useState(toPtBrDateTime(new Date().toISOString()));
  const [fimEm, setFimEm] = useState("");
  const [status, setStatus] = useState<StatusAgendamento>("AGENDADO");

  const statusOptions = useMemo(
    () => Object.entries(agendamentoStatusLabels).map(([value, label]) => ({ value, label })),
    [],
  );

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setAgendamentos(await agendamentosApi.list(session.token));
    } catch {
      Alert.alert("Agenda", "Falha ao carregar agendamentos.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadTrips = async () => {
      if (!session?.token) {
        return;
      }
      try {
        const trips = await tripsApi.list(session.token);
        setTripOptions(
          trips.map((trip) => ({
            value: String(trip.id),
            label: `${trip.origin} -> ${trip.destination}`,
          })),
        );
      } catch {
        Alert.alert("Agenda", "Não foi possível carregar as corridas.");
      }
    };
    loadTrips();
  }, [session?.token]);

  const create = async () => {
    if (!session?.token) {
      return;
    }
    if (!tripId || !titulo.trim()) {
      Alert.alert("Agenda", "Preencha tripId e título.");
      return;
    }
    if (!session.userId) {
      Alert.alert("Agenda", "Não foi possível identificar seu usuário na sessão.");
      return;
    }
    const inicioIso = toIsoFromPtBr(inicioEm);
    const fimIso = fimEm.trim() ? toIsoFromPtBr(fimEm) : undefined;
    if (!inicioIso) {
      Alert.alert("Agenda", "Data de início inválida. Use DD/MM/AAAA HH:mm.");
      return;
    }
    if (fimEm.trim() && !fimIso) {
      Alert.alert("Agenda", "Data de fim inválida. Use DD/MM/AAAA HH:mm.");
      return;
    }
    try {
      await agendamentosApi.create(session.token, {
        tripId: Number(tripId),
        usuarioId: session.userId,
        titulo: titulo.trim(),
        descricao: undefined,
        localEvento: localEvento || undefined,
        inicioEm: inicioIso,
        fimEm: fimIso,
        fusoHorario: "America/Sao_Paulo",
        lembreteMinutos: 30,
        idEventoExterno: undefined,
        status,
      });
      setTitulo("");
      setLocalEvento("");
      setTripId("");
      setFimEm("");
      setInicioEm(toPtBrDateTime(new Date().toISOString()));
      await load();
    } catch {
      Alert.alert("Agenda", "Não foi possível criar agendamento.");
    }
  };

  const remove = async (id: number) => {
    if (!session?.token) {
      return;
    }
    try {
      await agendamentosApi.remove(session.token, id);
      await load();
    } catch {
      Alert.alert("Agenda", "Não foi possível excluir.");
    }
  };

  const updateStatus = async (item: Agendamento, nextStatus: StatusAgendamento) => {
    if (!session?.token) {
      return;
    }
    try {
      await agendamentosApi.update(session.token, item.id, {
        tripId: item.tripId,
        usuarioId: item.usuarioId,
        titulo: item.titulo,
        descricao: item.descricao ?? undefined,
        localEvento: item.localEvento ?? undefined,
        inicioEm: item.inicioEm,
        fimEm: item.fimEm ?? undefined,
        fusoHorario: item.fusoHorario,
        lembreteMinutos: item.lembreteMinutos ?? undefined,
        idEventoExterno: item.idEventoExterno ?? undefined,
        status: nextStatus,
      });
      await load();
    } catch {
      Alert.alert("Agenda", "Não foi possível atualizar status.");
    }
  };

  const addToDeviceCalendar = async (item: Agendamento) => {
    const startDate = new Date(item.inicioEm);
    const endDate = item.fimEm ? new Date(item.fimEm) : new Date(startDate.getTime() + 60 * 60 * 1000);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      Alert.alert("Agenda", "Não foi possível converter a data do agendamento.");
      return;
    }

    await addEventToDeviceCalendar({
      title: item.titulo,
      startDate,
      endDate,
      location: item.localEvento ?? undefined,
      notes: item.descricao ?? undefined,
      timeZone: item.fusoHorario || "America/Sao_Paulo",
    });
  };

  return (
    <Screen>
      <SGCard title="Novo agendamento">
        <ChipSelect label="Corrida" value={tripId} options={tripOptions} onChange={setTripId} />
        <SGInput label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex: Embarque aeroporto" />
        <SGInput label="Local" value={localEvento} onChangeText={setLocalEvento} placeholder="Ex: Terminal 2, Hotel, Shopping" />
        <SGInput
          label="Início"
          value={inicioEm}
          onChangeText={setInicioEm}
          placeholder="Ex: 08/03/2026 14:30"
          keyboardType="numbers-and-punctuation"
        />
        <SGInput
          label="Fim (opcional)"
          value={fimEm}
          onChangeText={setFimEm}
          placeholder="Ex: 08/03/2026 15:30"
          keyboardType="numbers-and-punctuation"
        />
        <ChipSelect label="Status" value={status} options={statusOptions} onChange={(v) => setStatus(v as StatusAgendamento)} />
        <SGButton
          label="Criar agendamento"
          onPress={create}
          icon={<Ionicons name="calendar-outline" size={18} color="#fff" />}
        />
      </SGCard>

      <View style={styles.actions}>
        <SGButton
          label="Atualizar agenda"
          onPress={load}
          loading={loading}
          variant="secondary"
          icon={<Ionicons name="refresh-circle-outline" size={18} color="#fff" />}
        />
      </View>

      {agendamentos.length === 0 ? <EmptyState message="Nenhum agendamento encontrado." /> : null}

      {agendamentos.map((item) => (
        <SGCard key={item.id} title={item.titulo} subtitle={dateTime(item.inicioEm)}>
          <StatusBadge label={agendamentoStatusLabels[item.status]} status={item.status} />
          <Text style={styles.line}>Responsável: {item.usuarioNome ?? "Motorista"}</Text>
          <Text style={styles.line}>Corrida vinculada: #{item.tripId}</Text>
          <Text style={styles.line}>Local: {item.localEvento ?? "-"}</Text>
          <View style={styles.row}>
            <SGButton
              label="Concluir"
              onPress={() => updateStatus(item, "CONCLUIDO")}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color="#fff" />}
            />
            <SGButton
              label="Cancelar"
              onPress={() => updateStatus(item, "CANCELADO")}
              variant="danger"
              icon={<Ionicons name="close-circle-outline" size={18} color="#fff" />}
            />
          </View>
          <SGButton
            label="Adicionar ao calendário"
            onPress={() => addToDeviceCalendar(item)}
            variant="secondary"
            icon={<Ionicons name="calendar-clear-outline" size={18} color="#fff" />}
          />
          <SGButton
            label="Excluir"
            onPress={() => remove(item.id)}
            variant="danger"
            icon={<Ionicons name="trash-outline" size={18} color="#fff" />}
          />
        </SGCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: "100%",
  },
  line: {
    color: colors.subtext,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});

