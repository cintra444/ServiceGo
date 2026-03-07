import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { agendamentoStatusLabels } from "../../constants/labels";
import { colors, spacing } from "../../constants/theme";
import { agendamentosApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { dateTime } from "../../utils/format";
import type { Agendamento, StatusAgendamento } from "../../types/api";

export function ScheduleScreen() {
  const { session } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripId, setTripId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [inicioEm, setInicioEm] = useState(new Date().toISOString());
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
    try {
      await agendamentosApi.create(session.token, {
        tripId: Number(tripId),
        usuarioId: session.userId,
        titulo: titulo.trim(),
        descricao: undefined,
        localEvento: localEvento || undefined,
        inicioEm: inicioEm.trim(),
        fimEm: fimEm || undefined,
        fusoHorario: "America/Sao_Paulo",
        lembreteMinutos: 30,
        idEventoExterno: undefined,
        status,
      });
      setTitulo("");
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

  return (
    <Screen>
      <SGCard title="Novo agendamento" subtitle="Datas em ISO: 2026-03-03T10:30:00-03:00">
        <SGInput label="Trip ID" value={tripId} onChangeText={setTripId} keyboardType="number-pad" />
        <Text style={styles.line}>Usuário da sessão: {session?.userId ?? "-"}</Text>
        <SGInput label="Título" value={titulo} onChangeText={setTitulo} />
        <SGInput label="Local" value={localEvento} onChangeText={setLocalEvento} />
        <SGInput label="Início (ISO)" value={inicioEm} onChangeText={setInicioEm} />
        <SGInput label="Fim (ISO opcional)" value={fimEm} onChangeText={setFimEm} />
        <ChipSelect label="Status" value={status} options={statusOptions} onChange={(v) => setStatus(v as StatusAgendamento)} />
        <SGButton label="Criar agendamento" onPress={create} />
      </SGCard>

      <SGButton label="Atualizar agenda" onPress={load} loading={loading} variant="secondary" />

      {agendamentos.length === 0 ? <EmptyState message="Nenhum agendamento encontrado." /> : null}

      {agendamentos.map((item) => (
        <SGCard key={item.id} title={item.titulo} subtitle={dateTime(item.inicioEm)}>
          <StatusBadge label={agendamentoStatusLabels[item.status]} status={item.status} />
          <Text style={styles.line}>Usuário: {item.usuarioNome ?? `ID ${item.usuarioId}`}</Text>
          <Text style={styles.line}>Trip ID: {item.tripId}</Text>
          <Text style={styles.line}>Local: {item.localEvento ?? "-"}</Text>
          <View style={styles.row}>
            <SGButton label="Concluir" onPress={() => updateStatus(item, "CONCLUIDO")} />
            <SGButton label="Cancelar" onPress={() => updateStatus(item, "CANCELADO")} variant="danger" />
          </View>
          <SGButton label="Excluir" onPress={() => remove(item.id)} variant="danger" />
        </SGCard>
      ))}
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

