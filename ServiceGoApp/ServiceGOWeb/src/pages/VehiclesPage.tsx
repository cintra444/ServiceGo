import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { veiculosApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Veiculo } from "../types/api";
import { cleanText, parseNumber } from "../utils/format";

function VehicleIcon({
  kind,
}: {
  kind: "refresh" | "plus" | "vehicle" | "palette" | "odometer" | "owner" | "edit" | "trash";
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
    palette: (
      <>
        <path
          d="M12 4.5c-4.4 0-8 3.1-8 7 0 3.2 2.4 5.6 5.7 5.6h1.1c.7 0 1.2.6 1.2 1.2 0 .7.6 1.2 1.2 1.2 3.8 0 6.8-2.8 6.8-6.7 0-4.6-3.8-8.3-8-8.3Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="8.2" cy="11" r="1" fill="currentColor" />
        <circle cx="11.3" cy="8.5" r="1" fill="currentColor" />
        <circle cx="15.1" cy="9.3" r="1" fill="currentColor" />
      </>
    ),
    odometer: (
      <>
        <path
          d="M5.5 16a6.5 6.5 0 1 1 13 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="m12 12 3.2-2.1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </>
    ),
    owner: (
      <>
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M5.5 19a6.5 6.5 0 0 1 13 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
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
        <path d="m12.8 6.9 4.3 4.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    trash: (
      <path
        d="M5 7h14M9 7V5.8c0-.7.5-1.3 1.2-1.3h3.6c.7 0 1.2.6 1.2 1.3V7m-8.7 0 .8 11c.1 1 .9 1.8 1.9 1.8h5.9c1 0 1.8-.8 1.9-1.8l.8-11"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

const emptyForm = {
  modelo: "",
  placa: "",
  ano: "",
  cor: "",
  ativo: "true",
  kmAtual: "0",
};

export function VehiclesPage() {
  const { session } = useAuth();
  const isDriverSession = session?.role === "ROLE_MOTORISTA" || session?.role === "MOTORISTA";
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Veiculo | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setVehicles(await veiculosApi.list(session.token));
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar veículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.token]);

  const openCreate = () => {
    if (!isDriverSession) {
      setError("Veículos só podem ser criados por uma conta de motorista. Entre com um usuário MOTORISTA para cadastrar.");
      return;
    }
    setEditingVehicle(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (vehicle: Veiculo) => {
    if (!isDriverSession) {
      setError("Veículos só podem ser editados por uma conta de motorista. Entre com um usuário MOTORISTA para continuar.");
      return;
    }
    setEditingVehicle(vehicle);
    setForm({
      modelo: vehicle.modelo ?? "",
      placa: vehicle.placa ?? "",
      ano: String(vehicle.ano ?? ""),
      cor: vehicle.cor ?? "",
      ativo: vehicle.ativo ? "true" : "false",
      kmAtual: String(vehicle.kmAtual ?? 0),
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!isDriverSession) {
      setError("A API exige que o dono do veículo seja um usuário MOTORISTA. Faça login com uma conta de motorista para salvar.");
      return;
    }
    if (!session?.token || !session.userId) {
      setError("Não foi possível identificar o motorista da sessão.");
      return;
    }
    const ano = Number(form.ano);
    if (!form.modelo.trim() || !form.placa.trim() || !ano) {
      setError("Preencha modelo, placa e ano válido.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        modelo: form.modelo.trim(),
        placa: form.placa.trim().toUpperCase(),
        ano,
        cor: cleanText(form.cor),
        ativo: form.ativo === "true",
        kmAtual: parseNumber(form.kmAtual) ?? 0,
        donoUsuarioId: session.userId,
      };
      if (editingVehicle?.id) {
        await veiculosApi.update(session.token, editingVehicle.id, payload);
      } else {
        await veiculosApi.create(session.token, payload);
      }
      setModalOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao salvar veículo.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (vehicle: Veiculo) => {
    if (!session?.token || !window.confirm(`Excluir o veículo ${vehicle.modelo} - ${vehicle.placa}?`)) {
      return;
    }
    try {
      await veiculosApi.remove(session.token, vehicle.id);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir veículo.");
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Veículos"
        description="Cadastro completo da frota usada nas corridas e despesas."
        action={
          <div className="button-row">
            <button className="secondary-button" onClick={() => void load()} type="button">
              <span className="button-icon" aria-hidden="true">
                <VehicleIcon kind="refresh" />
              </span>
              Atualizar lista
            </button>
            <button className="primary-button" disabled={!isDriverSession} onClick={openCreate} type="button">
              <span className="button-icon" aria-hidden="true">
                <VehicleIcon kind="plus" />
              </span>
              Novo veículo
            </button>
          </div>
        }
      />

      <Panel title="Frota" subtitle="Mesmo fluxo do app para criar, editar e excluir veículos">
        {!isDriverSession ? (
          <div className="error-banner">
            A sessão atual não é de motorista. Para criar ou editar veículos na web, entre com uma conta `MOTORISTA`.
          </div>
        ) : null}
        {loading ? <DataState message="Carregando veículos..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && vehicles.length === 0 ? <DataState message="Nenhum veículo cadastrado." /> : null}
        {!loading && !error && vehicles.length > 0 ? (
          <div className="card-grid">
            {vehicles.map((vehicle) => (
              <article className="entity-card" key={vehicle.id}>
                <div className="entity-card-head">
                  <div>
                    <strong className="entity-card-title">
                      <span className="entity-card-icon" aria-hidden="true">
                        <VehicleIcon kind="vehicle" />
                      </span>
                      <span>
                        {vehicle.modelo} - {vehicle.placa}
                      </span>
                    </strong>
                    <span>Ano {vehicle.ano}</span>
                  </div>
                  <span className={`status-pill ${vehicle.ativo ? "status-concluida" : "status-cancelada"}`}>
                    {vehicle.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="detail-list">
                  <div>
                    <span className="detail-label">
                      <VehicleIcon kind="palette" /> Cor
                    </span>
                    <strong>{vehicle.cor ?? "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <VehicleIcon kind="odometer" /> KM atual
                    </span>
                    <strong>{vehicle.kmAtual}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <VehicleIcon kind="owner" /> Dono
                    </span>
                    <strong>{vehicle.donoNome ?? `ID ${vehicle.donoUsuarioId}`}</strong>
                  </div>
                </div>
                <div className="button-row">
                  <button className="secondary-button" disabled={!isDriverSession} onClick={() => openEdit(vehicle)} type="button">
                    <span className="button-icon" aria-hidden="true">
                      <VehicleIcon kind="edit" />
                    </span>
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => void remove(vehicle)} type="button">
                    <span className="button-icon" aria-hidden="true">
                      <VehicleIcon kind="trash" />
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
        title={editingVehicle ? "Editar veículo" : "Novo veículo"}
        subtitle={
          isDriverSession
            ? `Motorista vinculado: ${editingVehicle?.donoNome ?? session?.email ?? "-"}`
            : "Faça login com uma conta de motorista para cadastrar ou editar veículos."
        }
        onClose={() => setModalOpen(false)}
      >
        <div className="form-grid">
          <label className="field">
            <span>Modelo</span>
            <input value={form.modelo} onChange={(event) => setForm({ ...form, modelo: event.target.value })} />
          </label>
          <label className="field">
            <span>Placa</span>
            <input value={form.placa} onChange={(event) => setForm({ ...form, placa: event.target.value })} />
          </label>
          <label className="field">
            <span>Ano</span>
            <input value={form.ano} onChange={(event) => setForm({ ...form, ano: event.target.value })} />
          </label>
          <label className="field">
            <span>Cor</span>
            <input value={form.cor} onChange={(event) => setForm({ ...form, cor: event.target.value })} />
          </label>
          <label className="field">
            <span>KM atual</span>
            <input value={form.kmAtual} onChange={(event) => setForm({ ...form, kmAtual: event.target.value })} />
          </label>
          <label className="field">
            <span>Ativo</span>
            <select value={form.ativo} onChange={(event) => setForm({ ...form, ativo: event.target.value })}>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </label>
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setModalOpen(false)} type="button">
            Cancelar
          </button>
          <button className="primary-button" disabled={saving || !isDriverSession} onClick={() => void submit()} type="button">
            <span className="button-icon" aria-hidden="true">
              <VehicleIcon kind={editingVehicle ? "edit" : "plus"} />
            </span>
            {saving ? "Salvando..." : editingVehicle ? "Atualizar veículo" : "Criar veículo"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
