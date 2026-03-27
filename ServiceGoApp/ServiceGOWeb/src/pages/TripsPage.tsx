import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { PickerInput } from "../components/PickerInput";
import { useAuth } from "../context/AuthContext";
import { fuelTypeLabels, tripStatusLabels, tripTypeLabels } from "../constants/labels";
import { configuracaoApi, customersApi, paymentsApi, tripsApi, veiculosApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { ConfiguracaoUsuario, Customer, FuelType, Trip, TripStatus, TripType, Veiculo } from "../types/api";
import { downloadCalendarEvent } from "../utils/calendar";
import { cleanText, currency, dateTime, formatCurrencyInput, parseCurrencyInput, parseNumber, toIsoFromPtBr, toPtBrDateTime } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";
import { estimateTripProfit } from "../utils/profitEstimator";

function TripIcon({
  kind,
}: {
  kind:
    | "refresh"
    | "plus"
    | "route"
    | "type"
    | "customer"
    | "vehicle"
    | "money"
    | "edit"
    | "trash"
    | "calendar"
    | "profit"
    | "done";
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
    plus: (
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2.2" fill="currentColor" />
        <circle cx="18" cy="6" r="2.2" fill="currentColor" />
        <path
          d="M8.5 16c1.2-3.2 3.8-4.7 7-4.7H18"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2.4 2.4"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </>
    ),
    type: (
      <path
        d="M7 6h10M12 6v12M9 18h6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    customer: (
      <>
        <circle cx="12" cy="8" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M5.5 19a6.5 6.5 0 0 1 13 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </>
    ),
    vehicle: (
      <>
        <path
          d="M6.5 15.5h11l-1.1-4a2 2 0 0 0-1.9-1.5H9.6a2 2 0 0 0-1.9 1.5l-1.2 4Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="8.5" cy="17.5" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="17.5" r="1.5" fill="currentColor" />
      </>
    ),
    money: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 8v8M14.8 9.8c-.6-1-1.6-1.5-2.8-1.5-1.7 0-2.8.9-2.8 2.1 0 1.1.8 1.8 2.6 2.1l.4.1c1.9.3 2.8.9 2.8 2.1 0 1.5-1.4 2.5-3.4 2.5-1.5 0-2.7-.5-3.5-1.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </>
    ),
    edit: (
      <>
        <path
          d="M4 20h4.3L19 9.3 14.7 5 4 15.7V20Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="m12.8 6.9 4.3 4.3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </>
    ),
    trash: (
      <>
        <path
          d="M5 7h14M9 7V5.8c0-.7.5-1.3 1.2-1.3h3.6c.7 0 1.2.6 1.2 1.3V7m-8.7 0 .8 11c.1 1 .9 1.8 1.9 1.8h5.9c1 0 1.8-.8 1.9-1.8l.8-11"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </>
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
    profit: (
      <>
        <path
          d="M5 16.5 9.5 12l3 3 6.5-7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M15 8h4v4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </>
    ),
    done: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.8 12 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

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
  durationHours: "0",
  durationMinutes: "0",
  tollAmount: "",
  fuelType: "",
  fuelPrice: "",
  fuelEfficiencyKmLiter: "",
  estimatedAmount: "",
  actualAmount: "",
  notes: "",
};

const emptyConcludeForm = {
  actualAmount: "",
  tollAmount: "",
  createPayment: "true",
  paymentMethod: "PIX",
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
  const [concludeModalOpen, setConcludeModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [tripToConclude, setTripToConclude] = useState<Trip | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [concludeForm, setConcludeForm] = useState(emptyConcludeForm);

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
        const nextConfig = await configuracaoApi.get(session.token, session.userId);
        setConfig(nextConfig);
      } else {
        setConfig(null);
      }
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
      durationHours: "0",
      durationMinutes: "0",
      tollAmount: trip.tollAmount != null ? formatCurrencyInput(String(Math.round(Number(trip.tollAmount) * 100))) : "",
      fuelType: trip.fuelType ?? "",
      fuelPrice: trip.fuelPrice != null ? formatCurrencyInput(String(Math.round(Number(trip.fuelPrice) * 100))) : "",
      fuelEfficiencyKmLiter: trip.fuelEfficiencyKmLiter != null ? String(trip.fuelEfficiencyKmLiter) : "",
      estimatedAmount: trip.estimatedAmount != null ? formatCurrencyInput(String(Math.round(Number(trip.estimatedAmount) * 100))) : "",
      actualAmount: trip.actualAmount != null ? formatCurrencyInput(String(Math.round(Number(trip.actualAmount) * 100))) : "",
      notes: trip.notes ?? "",
    });
    setModalOpen(true);
  };

  const openConclude = (trip: Trip) => {
    setTripToConclude(trip);
    setConcludeForm({
      actualAmount: trip.actualAmount != null ? formatCurrencyInput(String(Math.round(Number(trip.actualAmount) * 100))) : trip.estimatedAmount != null ? formatCurrencyInput(String(Math.round(Number(trip.estimatedAmount) * 100))) : "",
      tollAmount: trip.tollAmount != null ? formatCurrencyInput(String(Math.round(Number(trip.tollAmount) * 100))) : "",
      createPayment: "true",
      paymentMethod: "PIX",
    });
    setConcludeModalOpen(true);
  };

  const isAppTrip = form.tripType === "CORRIDA_APP";
  const estimatedDurationMinutes = Number(form.durationHours || 0) * 60 + Number(form.durationMinutes || 0);
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
        fuelType: form.fuelType ? (form.fuelType as FuelType) : undefined,
        fuelPrice: parseCurrencyInput(form.fuelPrice),
        fuelEfficiencyKmLiter: parseNumber(form.fuelEfficiencyKmLiter),
        estimatedAmount: parseCurrencyInput(form.estimatedAmount),
        actualAmount: parseCurrencyInput(form.actualAmount),
      },
      config,
      estimatedMinutes: estimatedDurationMinutes,
      tollCost: parseCurrencyInput(form.tollAmount) ?? 0,
    });
    const ready =
      Number(parseCurrencyInput(form.actualAmount) ?? parseCurrencyInput(form.estimatedAmount) ?? 0) > 0 &&
      Number(parseNumber(form.distanceKm) ?? 0) > 0 &&
      estimatedDurationMinutes > 0;

    return { ...estimate, ready };
  }, [config, estimatedDurationMinutes, form]);

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
        estimatedAmount: parseCurrencyInput(form.estimatedAmount),
        actualAmount: parseCurrencyInput(form.actualAmount),
        tollAmount: parseCurrencyInput(form.tollAmount),
        fuelType: form.fuelType ? (form.fuelType as FuelType) : undefined,
        fuelPrice: parseCurrencyInput(form.fuelPrice),
        fuelEfficiencyKmLiter: parseNumber(form.fuelEfficiencyKmLiter),
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
      if (nextError instanceof ApiError && nextError.status === 404) {
        await load();
        setError("Essa corrida já não estava mais disponível. A lista foi atualizada.");
        return;
      }
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir corrida.");
    }
  };

  const concludeTrip = async () => {
    if (!session?.token || !tripToConclude) {
      return;
    }

    const actualAmount = parseCurrencyInput(concludeForm.actualAmount);
    const tollAmount = parseCurrencyInput(concludeForm.tollAmount);
    if (actualAmount === undefined || actualAmount <= 0) {
      setError("Informe o valor final recebido para concluir a corrida.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const concludePayload = {
        customerId: tripToConclude.customerId ?? null,
        veiculoId: tripToConclude.veiculoId,
        tripType: tripToConclude.tripType,
        status: "CONCLUIDA" as TripStatus,
        origin: tripToConclude.origin,
        destination: tripToConclude.destination,
        appPlatform: tripToConclude.appPlatform ?? undefined,
        startAt: tripToConclude.startAt,
        endAt: tripToConclude.endAt ?? new Date().toISOString(),
        distanceKm: tripToConclude.distanceKm ?? undefined,
        estimatedAmount: tripToConclude.estimatedAmount ?? undefined,
        actualAmount,
        tollAmount,
        fuelType: tripToConclude.fuelType ?? undefined,
        fuelPrice: tripToConclude.fuelPrice ?? undefined,
        fuelEfficiencyKmLiter: tripToConclude.fuelEfficiencyKmLiter ?? undefined,
        notes: tripToConclude.notes ?? undefined,
      };

      let concludedTrip: Trip | null = null;

      try {
        concludedTrip = await tripsApi.update(session.token, tripToConclude.id, concludePayload);
      } catch (nextError) {
        const refreshedTrips = await tripsApi.list(session.token);
        const persistedTrip = refreshedTrips.find((trip) => trip.id === tripToConclude.id) ?? null;
        if (!persistedTrip || persistedTrip.status !== "CONCLUIDA") {
          throw nextError;
        }
        concludedTrip = persistedTrip;
        setTrips(refreshedTrips);
      }

      if (concludeForm.createPayment === "true") {
        await paymentsApi.create(session.token, {
          tripId: tripToConclude.id,
          customerId: concludedTrip?.customerId ?? tripToConclude.customerId ?? null,
          method: concludeForm.paymentMethod as "PIX" | "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "TRANSFERENCIA" | "OUTRO",
          status: "PAGO",
          amount: actualAmount,
          pagamentoParcial: false,
          paidAt: new Date().toISOString(),
          dueAt: undefined,
          referenceCode: undefined,
          notes: "Pagamento gerado ao concluir a corrida.",
        });
      }

      setConcludeModalOpen(false);
      setTripToConclude(null);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "A corrida foi atualizada, mas houve uma falha ao finalizar o fluxo.");
    } finally {
      setSaving(false);
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
              <span className="button-icon" aria-hidden="true">
                <TripIcon kind="refresh" />
              </span>
              Atualizar lista
            </button>
            <button className="primary-button" onClick={openCreate} type="button">
              <span className="button-icon" aria-hidden="true">
                <TripIcon kind="plus" />
              </span>
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
                    <strong className="entity-card-title">
                      <span className="entity-card-icon" aria-hidden="true">
                        <TripIcon kind="route" />
                      </span>
                      <span>
                        {trip.origin} → {trip.destination}
                      </span>
                    </strong>
                    <span>{dateTime(trip.startAt)}</span>
                  </div>
                  <span className={`status-pill status-${trip.status.toLowerCase()}`}>{tripStatusLabels[trip.status]}</span>
                </div>
                <div className="detail-grid">
                  <div>
                    <span className="detail-label">
                      <TripIcon kind="type" /> Tipo
                    </span>
                    <strong>{tripTypeLabels[trip.tripType]}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <TripIcon kind="customer" /> Cliente
                    </span>
                    <strong>{trip.customerName ?? "Não vinculado"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <TripIcon kind="vehicle" /> Veículo
                    </span>
                    <strong>{trip.veiculoModelo ?? trip.veiculoPlaca ?? "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <TripIcon kind="money" /> Valor
                    </span>
                    <strong>{currency(trip.actualAmount ?? trip.estimatedAmount)}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <TripIcon kind="money" /> Pedágio
                    </span>
                    <strong>{currency(trip.tollAmount)}</strong>
                  </div>
                </div>
                <div className="button-row">
                  {trip.status !== "CONCLUIDA" && trip.status !== "CANCELADA" ? (
                    <button className="primary-button" onClick={() => openConclude(trip)} type="button">
                      <span className="button-icon" aria-hidden="true">
                        <TripIcon kind="done" />
                      </span>
                      Concluir
                    </button>
                  ) : null}
                  <button className="secondary-button" onClick={() => openEdit(trip)} type="button">
                    <span className="button-icon" aria-hidden="true">
                      <TripIcon kind="edit" />
                    </span>
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => void remove(trip)} type="button">
                    <span className="button-icon" aria-hidden="true">
                      <TripIcon kind="trash" />
                    </span>
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
        subtitle="Preencha origem, destino, tipo, status e os dados financeiros da corrida."
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
            <PickerInput value={form.startAt} onChange={(value) => setForm({ ...form, startAt: value })} mode="datetime" placeholder="DD/MM/AAAA HH:mm" />
          </label>
          <label className="field">
            <span>Fim</span>
            <PickerInput value={form.endAt} onChange={(value) => setForm({ ...form, endAt: value })} mode="datetime" placeholder="DD/MM/AAAA HH:mm" />
          </label>
          <label className="field">
            <span>Distância km</span>
            <input className="numeric-input" inputMode="decimal" value={form.distanceKm} onChange={(event) => setForm({ ...form, distanceKm: event.target.value })} />
          </label>
          <label className="field">
            <span>Duração (horas)</span>
            <select value={form.durationHours} onChange={(event) => setForm({ ...form, durationHours: event.target.value })}>
              {Array.from({ length: 13 }).map((_, index) => (
                <option key={index} value={String(index)}>
                  {index}h
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Duração (minutos)</span>
            <select value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}>
              {[0, 5, 10, 15, 20, 30, 40, 45, 50, 55].map((value) => (
                <option key={value} value={String(value)}>
                  {String(value).padStart(2, "0")} min
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Pedágio</span>
            <input className="money-input" inputMode="decimal" value={form.tollAmount} onChange={(event) => setForm({ ...form, tollAmount: formatCurrencyInput(event.target.value) })} placeholder="R$ 0,00" />
          </label>
          <label className="field">
            <span>Combustível da corrida</span>
            <select value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value })}>
              <option value="">Usar ajuste padrão</option>
              {Object.entries(fuelTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Preço do combustível na corrida</span>
            <input
              className="money-input"
              inputMode="decimal"
              value={form.fuelPrice}
              onChange={(event) => setForm({ ...form, fuelPrice: formatCurrencyInput(event.target.value) })}
              placeholder={config?.fuelPrice != null ? `Padrão atual: ${currency(config.fuelPrice)}` : "R$ 0,00"}
            />
          </label>
          <label className="field">
            <span>Consumo km/l na corrida</span>
            <input
              className="numeric-input"
              inputMode="decimal"
              value={form.fuelEfficiencyKmLiter}
              onChange={(event) => setForm({ ...form, fuelEfficiencyKmLiter: event.target.value })}
              placeholder={config?.fuelEfficiencyKmLiter != null ? `Padrão atual: ${config.fuelEfficiencyKmLiter}` : "Ex: 11,5"}
            />
          </label>
          <label className="field">
            <span>Valor estimado da corrida</span>
            <input
              value={form.estimatedAmount}
              className="money-input"
              inputMode="decimal"
              onChange={(event) => setForm({ ...form, estimatedAmount: formatCurrencyInput(event.target.value) })}
              placeholder="R$ 0,00"
            />
          </label>
          <label className="field">
            <span>Valor recebido</span>
            <input className="money-input" inputMode="decimal" value={form.actualAmount} onChange={(event) => setForm({ ...form, actualAmount: formatCurrencyInput(event.target.value) })} placeholder="R$ 0,00" />
          </label>
          <label className="field field-full">
            <span>Observações</span>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} />
          </label>
        </div>

        {isPremium ? (
          <div className="premium-box">
            <strong className="premium-box-title">
              <span className="premium-box-icon" aria-hidden="true">
                <TripIcon kind="profit" />
              </span>
              Estimativa de lucro
            </strong>
            <div className="detail-grid">
              <div>
                <span>Km operacional</span>
                <strong>{calculator.operationalDistanceKm.toFixed(2)} km</strong>
              </div>
              <div>
                <span>Combustível</span>
                <strong>{currency(calculator.fuelCost)}</strong>
              </div>
              <div>
                <span>Pedágio</span>
                <strong>{currency(calculator.tollCost)}</strong>
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
            <span className="helper-text">
              A calculadora considera ida e volta no custo operacional. A distância informada e tratada em dobro para combustível e depreciação.
            </span>
            {!calculator.ready ? <span className="helper-text">Preencha valor, distância e duração da corrida.</span> : null}
            <span className="helper-text">Sem preenchimento na corrida, o cálculo usa o combustível padrão salvo em Ajustes.</span>
          </div>
        ) : null}

        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setModalOpen(false)} type="button">
            Cancelar
          </button>
          {isPremium ? (
            <button className="secondary-button" disabled={saving} onClick={() => void submit(true)} type="button">
              <span className="button-icon" aria-hidden="true">
                <TripIcon kind="calendar" />
              </span>
              {saving ? "Salvando..." : "Salvar e exportar calendário"}
            </button>
          ) : null}
          <button className="primary-button" disabled={saving} onClick={() => void submit()} type="button">
            <span className="button-icon" aria-hidden="true">
              <TripIcon kind={editingTrip ? "edit" : "plus"} />
            </span>
            {saving ? "Salvando..." : editingTrip ? "Atualizar corrida" : "Criar corrida"}
          </button>
        </div>
      </Modal>

      <Modal
        open={concludeModalOpen}
        title="Concluir corrida"
        subtitle="Informe o valor final e, se quiser, já registre o pagamento para refletir no painel."
        onClose={() => setConcludeModalOpen(false)}
      >
        <div className="form-grid">
          <label className="field">
            <span>Valor final recebido</span>
            <input
              className="money-input"
              inputMode="decimal"
              value={concludeForm.actualAmount}
              onChange={(event) => setConcludeForm({ ...concludeForm, actualAmount: formatCurrencyInput(event.target.value) })}
              placeholder="R$ 0,00"
            />
          </label>
          <label className="field">
            <span>Pedágio final</span>
            <input
              className="money-input"
              inputMode="decimal"
              value={concludeForm.tollAmount}
              onChange={(event) => setConcludeForm({ ...concludeForm, tollAmount: formatCurrencyInput(event.target.value) })}
              placeholder="R$ 0,00"
            />
          </label>
          <label className="field">
            <span>Registrar pagamento agora</span>
            <select
              value={concludeForm.createPayment}
              onChange={(event) => setConcludeForm({ ...concludeForm, createPayment: event.target.value })}
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </label>
          {concludeForm.createPayment === "true" ? (
            <label className="field">
              <span>Método de pagamento</span>
              <select
                value={concludeForm.paymentMethod}
                onChange={(event) => setConcludeForm({ ...concludeForm, paymentMethod: event.target.value })}
              >
                <option value="PIX">Pix</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO_CREDITO">Cartão crédito</option>
                <option value="CARTAO_DEBITO">Cartão débito</option>
                <option value="TRANSFERENCIA">Transferência</option>
                <option value="OUTRO">Outro</option>
              </select>
            </label>
          ) : null}
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setConcludeModalOpen(false)} type="button">
            Cancelar
          </button>
          <button className="primary-button" disabled={saving} onClick={() => void concludeTrip()} type="button">
            <span className="button-icon" aria-hidden="true">
              <TripIcon kind="done" />
            </span>
            {saving ? "Concluindo..." : "Concluir corrida"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
