import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { agendamentoStatusLabels } from "../constants/labels";
import { agendamentosApi, tripsApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Agendamento, StatusAgendamento, Trip } from "../types/api";
import { downloadCalendarEvent } from "../utils/calendar";
import { dateTime, toIsoFromPtBr, toPtBrDateTime } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";

export function SchedulePage() {
  const { session } = useAuth();
  const isPremium = hasPremiumAccess(session?.plan);
  const [events, setEvents] = useState<Agendamento[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripId, setTripId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [inicioEm, setInicioEm] = useState(toPtBrDateTime(new Date().toISOString()));
  const [fimEm, setFimEm] = useState("");
  const [status, setStatus] = useState<StatusAgendamento>("AGENDADO");

  const load = async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [nextEvents, nextTrips] = await Promise.all([
        agendamentosApi.list(session.token),
        tripsApi.list(session.token),
      ]);
      setEvents(nextEvents);
      setTrips(nextTrips);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.token]);

  const create = async () => {
    if (!session?.token || !session.userId) {
      return;
    }
    const inicioIso = toIsoFromPtBr(inicioEm);
    const fimIso = fimEm.trim() ? toIsoFromPtBr(fimEm) : undefined;
    if (!tripId || !titulo.trim() || !inicioIso) {
      setError("Preencha corrida, título e início válido.");
      return;
    }
    if (fimEm.trim() && !fimIso) {
      setError("Fim inválido. Use DD/MM/AAAA HH:mm.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await agendamentosApi.create(session.token, {
        tripId: Number(tripId),
        usuarioId: session.userId,
        titulo: titulo.trim(),
        descricao: undefined,
        localEvento: localEvento.trim() || undefined,
        inicioEm: inicioIso,
        fimEm: fimIso,
        fusoHorario: "America/Sao_Paulo",
        lembreteMinutos: 30,
        idEventoExterno: undefined,
        status,
      });
      setTripId("");
      setTitulo("");
      setLocalEvento("");
      setFimEm("");
      setInicioEm(toPtBrDateTime(new Date().toISOString()));
      setStatus("AGENDADO");
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível criar agendamento.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Agendamento) => {
    if (!session?.token || !window.confirm(`Excluir o agendamento "${item.titulo}"?`)) {
      return;
    }
    try {
      await agendamentosApi.remove(session.token, item.id);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir agendamento.");
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
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível atualizar status.");
    }
  };

  const exportEvent = (item: Agendamento) => {
    const startDate = new Date(item.inicioEm);
    const endDate = item.fimEm ? new Date(item.fimEm) : new Date(startDate.getTime() + 60 * 60 * 1000);
    downloadCalendarEvent({
      title: item.titulo,
      startDate,
      endDate,
      location: item.localEvento ?? undefined,
      notes: item.descricao ?? undefined,
    });
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Agenda"
        description="Criar agendamentos, concluir, cancelar, excluir e exportar para calendário."
        action={
          <button className="secondary-button" onClick={() => void load()} type="button">
            Atualizar agenda
          </button>
        }
      />

      <Panel title="Novo agendamento" subtitle="Mesmo fluxo do app para organizar compromissos ligados às corridas">
        {error ? <div className="error-banner">{error}</div> : null}
        <div className="form-grid">
          <label className="field">
            <span>Corrida</span>
            <select value={tripId} onChange={(event) => setTripId(event.target.value)}>
              <option value="">Selecione</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.origin} - {trip.destination}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Título</span>
            <input value={titulo} onChange={(event) => setTitulo(event.target.value)} />
          </label>
          <label className="field">
            <span>Local</span>
            <input value={localEvento} onChange={(event) => setLocalEvento(event.target.value)} />
          </label>
          <label className="field">
            <span>Início</span>
            <input value={inicioEm} onChange={(event) => setInicioEm(event.target.value)} />
          </label>
          <label className="field">
            <span>Fim</span>
            <input value={fimEm} onChange={(event) => setFimEm(event.target.value)} />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusAgendamento)}>
              {Object.entries(agendamentoStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="button-row">
          <button className="primary-button" disabled={saving} onClick={() => void create()} type="button">
            {saving ? "Criando..." : "Criar agendamento"}
          </button>
        </div>
      </Panel>

      <Panel title="Agendamentos" subtitle="Lista atual da agenda">
        {loading ? <DataState message="Carregando agenda..." /> : null}
        {!loading && events.length === 0 ? <DataState message="Nenhum agendamento encontrado." /> : null}
        {events.map((item) => (
          <div className="entity-card entity-card-inline" key={item.id}>
            <div className="entity-card-head">
              <div>
                <strong>{item.titulo}</strong>
                <span>{dateTime(item.inicioEm)}</span>
              </div>
              <span className={`status-pill status-${item.status.toLowerCase()}`}>{agendamentoStatusLabels[item.status]}</span>
            </div>
            <div className="detail-grid">
              <div><span>Responsável</span><strong>{item.usuarioNome ?? "Motorista"}</strong></div>
              <div><span>Corrida</span><strong>#{item.tripId}</strong></div>
              <div><span>Local</span><strong>{item.localEvento ?? "-"}</strong></div>
            </div>
            <div className="button-row">
              <button className="secondary-button" onClick={() => void updateStatus(item, "CONCLUIDO")} type="button">Concluir</button>
              <button className="secondary-button" onClick={() => void updateStatus(item, "CANCELADO")} type="button">Cancelar</button>
              {isPremium ? (
                <button className="secondary-button" onClick={() => exportEvent(item)} type="button">Exportar calendário</button>
              ) : null}
              <button className="danger-button" onClick={() => void remove(item)} type="button">Excluir</button>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
