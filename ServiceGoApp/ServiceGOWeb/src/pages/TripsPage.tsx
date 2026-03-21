import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { tripStatusLabels, tripTypeLabels } from "../constants/labels";
import { customersApi, tripsApi, veiculosApi, configuracaoApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import { getFuelSettings } from "../services/storage";
import type { ConfiguracaoUsuario, Customer, Trip, TripStatus, TripType, Veiculo } from "../types/api";
import { downloadCalendarEvent } from "../utils/calendar";
import { cleanText, currency, dateTime, parseNumber, toIsoFromPtBr, toPtBrDateTime } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";
import { estimateTripProfit } from "../utils/profitEstimator";

const emptyForm = {
  customerId: "",
  veiculoId: "",
  tripType: "CORRIDA_APP" as TripType,
  status: "AGENDADA" as TripStatus,
  origin: "",
  destination: "",
  tripDetail: "",
  startAt: toPtBrDateTime(new Date().toISOString()),
  endAt: "",
  distanceKm: "",
  estimatedMinutes: "",
  estimatedAmount: "",
  actualAmount: "",
  notes: "",
};

export function TripsPage() {
  const { session } = useAuth();
  const isPremium = hasPremiumAccess(session?.plan);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [config, setConfig] = useState<ConfiguracaoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fuelPrice, setFuelPrice] = useState(0);
  const [fuelEfficiencyKmPerLiter, setFuelEfficiencyKmPerLiter] = useState(0);

  const load = async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [nextTrips, nextCustomers, nextVehicles] = await Promise.all([
        tripsApi.list(session.token),
        customersApi.list(session.token),
        veiculosApi.list(session.token),
      ]);
      setTrips(nextTrips);
      setCustomers(nextCustomers);
      setVehicles(nextVehicles);
      if (session.userId) {
        setConfig(await configuracaoApi.get(session.token, session.userId));
      }
      const fuelSettings = getFuelSettings();
      setFuelPrice(Number(fuelSettings.fuelPrice ?? 0));
      setFuelEfficiencyKmPerLiter(Number(fuelSettings.fuelEfficiencyKmPerLiter ?? 0));
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar corridas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.token, session?.userId]);

  const openCreate = () => {
    setEditingTrip(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setForm({
      customerId: trip.customerId ? String(trip.customerId) : "",
      veiculoId: String(trip.veiculoId ?? ""),
      tripType: trip.tripType,
      status: trip.status,
      origin: trip.origin ?? "",
      destination: trip.destination ?? "",
      tripDetail: trip.appPlatform ?? "",
      startAt: toPtBrDateTime(trip.startAt),
      endAt: toPtBrDateTime(trip.endAt),
      distanceKm: trip.distanceKm ? String(trip.distanceKm) : "",
      estimatedMinutes: "",
      estimatedAmount: trip.estimatedAmount ? String(trip.estimatedAmount) : "",
      actualAmount: trip.actualAmount ? String(trip.actualAmount) : "",
      notes: trip.notes ?? "",
    });
    setModalOpen(true);
  };

  const isAppTrip = form.tripType === "CORRIDA_APP";
  const tripDetailLabel =
    form.tripType === "TRASLADO_AEROPORTO"
      ? "Aeroporto"
      : form.tripType === "INTERMUNICIPAL"
        ? "Cidade de destino"
        : form.tripType === "LOCAL_ESPECIFICO"
          ? "Nome do local"
          : "Plataforma do app";

  const calculator = useMemo(() => {
    const estimate = estimateTripProfit({
      trip: {
        id: 0,
        veiculoId: Number(form.veiculoId || 0),
        tripType: form.tripType,
        status: form.status,
        origin: form.origin,
        destination: form.destination,
        startAt: "",
        distanceKm: parseNumber(form.distanceKm),
        estimatedAmount: parseNumber(form.estimatedAmount),
        actualAmount: parseNumber(form.actualAmount),
      },
      config,
      fuelPrice,
      fuelEfficiencyKmPerLiter,
      estimatedMinutes: parseNumber(form.estimatedMinutes) ?? 0,
    });
    const ready =
      Number(parseNumber(form.actualAmount) ?? parseNumber(form.estimatedAmount) ?? 0) > 0 &&
      Number(parseNumber(form.distanceKm) ?? 0) > 0 &&
      Number(parseNumber(form.estimatedMinutes) ?? 0) > 0;

    return { ...estimate, ready };
  }, [config, form, fuelEfficiencyKmPerLiter, fuelPrice]);

  const submit = async (addToCalendar = false) => {
    if (!session?.token) {
      return;
    }
    const veiculoId = Number(form.veiculoId);
    if (!form.origin.trim() || !form.destination.trim() || !veiculoId) {
      setError("Preencha origem, destino e veículo.");
      return;
    }
    if (!isAppTrip && !form.customerId) {
      setError("Para corrida fora de app, selecione um cliente.");
      return;
    }
    const startAt = toIsoFromPtBr(form.startAt);
    const endAt = form.endAt.trim() ? toIsoFromPtBr(form.endAt) : undefined;
    if (!startAt) {
      setError("Início inválido. Use DD/MM/AAAA HH:mm.");
      return;
    }
    if (form.endAt.trim() && !endAt) {
      setError("Fim inválido. Use DD/MM/AAAA HH:mm.");
      return;
    }

    const detailText = cleanText(form.tripDetail);
    const notesText = cleanText(form.notes);
    const contextualNotes =
      !isAppTrip && detailText ? cleanText(`${tripDetailLabel}: ${detailText}${notesText ? ` | ${notesText}` : ""}`) : notesText;

    try {
      setSaving(true);
      setError(null);
      const payload = {
        customerId: form.customerId ? Number(form.customerId) : null,
        veiculoId,
        tripType: form.tripType,
        status: form.status,
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        appPlatform: isAppTrip ? detailText : undefined,
        startAt,
        endAt,
        distanceKm: parseNumber(form.distanceKm),
        estimatedAmount: parseNumber(form.estimatedAmount),
        actualAmount: parseNumber(form.actualAmount),
        notes: contextualNotes,
      };
      if (editingTrip?.id) {
        await tripsApi.update(session.token, editingTrip.id, payload);
      } else {
        await tripsApi.create(session.token, payload);
      }

      if (addToCalendar && isPremium) {
        const startDate = new Date(startAt);
        const endDate = endAt ? new Date(endAt) : new Date(startDate.getTime() + 60 * 60 * 1000);
        downloadCalendarEvent({
          title: `${form.origin.trim()} -> ${form.destination.trim()}`,
          startDate,
          endDate,
          location: form.destination.trim(),
          notes: contextualNotes,
        });
      }

      setModalOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao salvar corrida.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (trip: Trip) => {
    if (!session?.token || !window.confirm(`Excluir a corrida ${trip.origin} -> ${trip.destination}?`)) {
      return;
    }
    try {
      await tripsApi.remove(session.token, trip.id);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir corrida.");
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Corridas"
        description="Cadastro, edição e acompanhamento das viagens registradas no ServiceGO."
        action={
          <div className="button-row">
            <button className="secondary-button" onClick={() => void load()} type="button">
              Atualizar lista
            </button>
            <button className="primary-button" onClick={openCreate} type="button">
              Nova corrida
            </button>
          </div>
        }
      />

      <Panel title="Lista de corridas" subtitle="Mesmas ações do app: criar, editar, excluir e consultar">
        {loading ? <DataState message="Carregando corridas..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && trips.length === 0 ? <DataState message="Nenhuma corrida cadastrada." /> : null}
        {!loading && !error && trips.length > 0 ? (
          <div className="card-grid">
            {trips.map((trip) => (
              <article className="entity-card" key={trip.id}>
                <div className="entity-card-head">
                  <div>
                    <strong>
                      {trip.origin} → {trip.destination}
                    </strong>
                    <span>{dateTime(trip.startAt)}</span>
                  </div>
                  <span className={`status-pill status-${trip.status.toLowerCase()}`}>{tripStatusLabels[trip.status]}</span>
                </div>
                <div className="detail-grid">
                  <div>
                    <span>Tipo</span>
                    <strong>{tripTypeLabels[trip.tripType]}</strong>
                  </div>
                  <div>
                    <span>Cliente</span>
                    <strong>{trip.customerName ?? "Não vinculado"}</strong>
                  </div>
                  <div>
                    <span>Veículo</span>
                    <strong>{trip.veiculoModelo ?? trip.veiculoPlaca ?? "-"}</strong>
                  </div>
                  <div>
                    <span>Valor</span>
                    <strong>{currency(trip.actualAmount ?? trip.estimatedAmount)}</strong>
                  </div>
                </div>
                <div className="button-row">
                  <button className="secondary-button" onClick={() => openEdit(trip)} type="button">
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => void remove(trip)} type="button">
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Panel>

      <Modal
        open={modalOpen}
        title={editingTrip ? "Editar corrida" : "Nova corrida"}
        subtitle="Preencha origem, destino, tipo, status e os dados financeiros da viagem."
        onClose={() => setModalOpen(false)}
      >
        <div className="form-grid">
          <label className="field">
            <span>Origem</span>
            <input value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
          </label>
          <label className="field">
            <span>Destino</span>
            <input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} />
          </label>
          <label className="field">
            <span>Tipo de corrida</span>
            <select value={form.tripType} onChange={(event) => setForm({ ...form, tripType: event.target.value as TripType })}>
              {Object.entries(tripTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TripStatus })}>
              {Object.entries(tripStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {!isAppTrip ? (
            <label className="field">
              <span>Cliente</span>
              <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
                <option value="">Selecione</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="field">
            <span>Veículo</span>
            <select value={form.veiculoId} onChange={(event) => setForm({ ...form, veiculoId: event.target.value })}>
              <option value="">Selecione</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.placa} - {vehicle.modelo}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{tripDetailLabel}</span>
            <input value={form.tripDetail} onChange={(event) => setForm({ ...form, tripDetail: event.target.value })} />
          </label>
          <label className="field">
            <span>Início</span>
            <input value={form.startAt} onChange={(event) => setForm({ ...form, startAt: event.target.value })} />
          </label>
          <label className="field">
            <span>Fim</span>
            <input value={form.endAt} onChange={(event) => setForm({ ...form, endAt: event.target.value })} />
          </label>
          <label className="field">
            <span>Distância km</span>
            <input value={form.distanceKm} onChange={(event) => setForm({ ...form, distanceKm: event.target.value })} />
          </label>
          <label className="field">
            <span>Tempo estimado (min)</span>
            <input
              value={form.estimatedMinutes}
              onChange={(event) => setForm({ ...form, estimatedMinutes: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Valor estimado</span>
            <input
              value={form.estimatedAmount}
              onChange={(event) => setForm({ ...form, estimatedAmount: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Valor real</span>
            <input value={form.actualAmount} onChange={(event) => setForm({ ...form, actualAmount: event.target.value })} />
          </label>
          <label className="field field-full">
            <span>Observações</span>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} />
          </label>
        </div>

        {isPremium ? (
          <div className="premium-box">
            <strong>Estimativa de lucro</strong>
            <div className="detail-grid">
              <div>
                <span>Combustível</span>
                <strong>{currency(calculator.fuelCost)}</strong>
              </div>
              <div>
                <span>Depreciação</span>
                <strong>{currency(calculator.depreciationCost)}</strong>
              </div>
              <div>
                <span>Custo total</span>
                <strong>{currency(calculator.totalCost)}</strong>
              </div>
              <div>
                <span>Lucro estimado</span>
                <strong>{currency(calculator.profit)}</strong>
              </div>
              <div>
                <span>Lucro por km</span>
                <strong>{currency(calculator.profitPerKm)}</strong>
              </div>
              <div>
                <span>Lucro por hora</span>
                <strong>{currency(calculator.profitPerHour)}/h</strong>
              </div>
            </div>
            {!calculator.ready ? <span className="helper-text">Preencha valor, distância e tempo estimado.</span> : null}
          </div>
        ) : null}

        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setModalOpen(false)} type="button">
            Cancelar
          </button>
          {isPremium ? (
            <button className="secondary-button" disabled={saving} onClick={() => void submit(true)} type="button">
              {saving ? "Salvando..." : "Salvar e exportar calendário"}
            </button>
          ) : null}
          <button className="primary-button" disabled={saving} onClick={() => void submit()} type="button">
            {saving ? "Salvando..." : editingTrip ? "Atualizar corrida" : "Criar corrida"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
