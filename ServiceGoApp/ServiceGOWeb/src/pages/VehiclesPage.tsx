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
    setEditingVehicle(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (vehicle: Veiculo) => {
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
              Atualizar lista
            </button>
            <button className="primary-button" onClick={openCreate} type="button">
              Novo veículo
            </button>
          </div>
        }
      />

      <Panel title="Frota" subtitle="Mesmo fluxo do app para criar, editar e excluir veículos">
        {loading ? <DataState message="Carregando veículos..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && vehicles.length === 0 ? <DataState message="Nenhum veículo cadastrado." /> : null}
        {!loading && !error && vehicles.length > 0 ? (
          <div className="card-grid">
            {vehicles.map((vehicle) => (
              <article className="entity-card" key={vehicle.id}>
                <div className="entity-card-head">
                  <div>
                    <strong>
                      {vehicle.modelo} - {vehicle.placa}
                    </strong>
                    <span>Ano {vehicle.ano}</span>
                  </div>
                  <span className={`status-pill ${vehicle.ativo ? "status-concluida" : "status-cancelada"}`}>
                    {vehicle.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="detail-list">
                  <div>
                    <span>Cor</span>
                    <strong>{vehicle.cor ?? "-"}</strong>
                  </div>
                  <div>
                    <span>KM atual</span>
                    <strong>{vehicle.kmAtual}</strong>
                  </div>
                  <div>
                    <span>Dono</span>
                    <strong>{vehicle.donoNome ?? `ID ${vehicle.donoUsuarioId}`}</strong>
                  </div>
                </div>
                <div className="button-row">
                  <button className="secondary-button" onClick={() => openEdit(vehicle)} type="button">
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => void remove(vehicle)} type="button">
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
        subtitle={`Motorista vinculado: ${editingVehicle?.donoNome ?? session?.email ?? "-"}`}
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
          <button className="primary-button" disabled={saving} onClick={() => void submit()} type="button">
            {saving ? "Salvando..." : editingVehicle ? "Atualizar veículo" : "Criar veículo"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
