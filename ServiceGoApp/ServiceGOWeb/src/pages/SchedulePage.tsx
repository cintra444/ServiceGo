import { useEffect, useState } from "react";
import { PickerInput } from "../components/PickerInput";
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

function ScheduleIcon({
  kind,
}: {
  kind: "refresh" | "calendar" | "trip" | "user" | "location" | "done" | "cancel" | "export" | "trash";
}) {
  const icons = {
    refresh: (
      <path
        d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    calendar: (
      <>
        <path
          d="M7 4.8v2.4M17 4.8v2.4M5.5 8.2h13M6.8 6.5h10.4c.9 0 1.6.7 1.6 1.6v9.9c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6V8.1c0-.9.7-1.6 1.6-1.6Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </>
    ),
    trip: (
      <>
        <circle cx="6" cy="18" r="2.2" fill="currentColor" />
        <circle cx="18" cy="6" r="2.2" fill="currentColor" />
        <path d="M8.5 16c1.2-3.2 3.8-4.7 7-4.7H18" fill="none" stroke="currentColor" strokeDasharray="2.4 2.4" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    location: (
      <>
        <path d="M12 20s5-5.6 5-9.2A5 5 0 1 0 7 10.8C7 14.4 12 20 12 20Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="12" cy="10.5" r="1.7" fill="currentColor" />
      </>
    ),
    done: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.8 12 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    cancel: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m9 9 6 6m0-6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    export: (
      <>
        <path d="M12 4.8v9.8m0 0 3.3-3.3M12 14.6l-3.3-3.3M6.2 18.4h11.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    trash: (
      <path d="M5 7h14M9 7V5.8c0-.7.5-1.3 1.2-1.3h3.6c.7 0 1.2.6 1.2 1.3V7m-8.7 0 .8 11c.1 1 .9 1.8 1.9 1.8h5.9c1 0 1.8-.8 1.9-1.8l.8-11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

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
            <span className="button-icon" aria-hidden="true">
              <ScheduleIcon kind="refresh" />
            </span>
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
            <PickerInput value={inicioEm} onChange={setInicioEm} mode="datetime" placeholder="DD/MM/AAAA HH:mm" />
          </label>
          <label className="field">
            <span>Fim</span>
            <PickerInput value={fimEm} onChange={setFimEm} mode="datetime" placeholder="DD/MM/AAAA HH:mm" />
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
            <span className="button-icon" aria-hidden="true">
              <ScheduleIcon kind="calendar" />
            </span>
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
                <strong className="entity-card-title">
                  <span className="entity-card-icon" aria-hidden="true">
                    <ScheduleIcon kind="calendar" />
                  </span>
                  <span>{item.titulo}</span>
                </strong>
                <span>{dateTime(item.inicioEm)}</span>
              </div>
              <span className={`status-pill status-${item.status.toLowerCase()}`}>{agendamentoStatusLabels[item.status]}</span>
            </div>
            <div className="detail-grid">
              <div><span className="detail-label"><ScheduleIcon kind="user" /> Responsável</span><strong>{item.usuarioNome ?? "Motorista"}</strong></div>
              <div><span className="detail-label"><ScheduleIcon kind="trip" /> Corrida</span><strong>#{item.tripId}</strong></div>
              <div><span className="detail-label"><ScheduleIcon kind="location" /> Local</span><strong>{item.localEvento ?? "-"}</strong></div>
            </div>
            <div className="button-row">
              <button className="secondary-button" onClick={() => void updateStatus(item, "CONCLUIDO")} type="button">
                <span className="button-icon" aria-hidden="true">
                  <ScheduleIcon kind="done" />
                </span>
                Concluir
              </button>
              <button className="secondary-button" onClick={() => void updateStatus(item, "CANCELADO")} type="button">
                <span className="button-icon" aria-hidden="true">
                  <ScheduleIcon kind="cancel" />
                </span>
                Cancelar
              </button>
              {isPremium ? (
                <button className="secondary-button" onClick={() => exportEvent(item)} type="button">
                  <span className="button-icon" aria-hidden="true">
                    <ScheduleIcon kind="export" />
                  </span>
                  Exportar calendário
                </button>
              ) : null}
              <button className="danger-button" onClick={() => void remove(item)} type="button">
                <span className="button-icon" aria-hidden="true">
                  <ScheduleIcon kind="trash" />
                </span>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
