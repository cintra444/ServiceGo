import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { customersApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Customer } from "../types/api";
import { cleanText } from "../utils/format";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  notes: "",
};

export function CustomersPage() {
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setCustomers(await customersApi.list(session.token));
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.token]);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      notes: customer.notes ?? "",
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!session?.token || !form.name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Informe um e-mail válido ou deixe em branco.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: form.name.trim(),
        phone: cleanText(form.phone),
        email: cleanText(form.email),
        notes: cleanText(form.notes),
      };
      if (editingCustomer?.id) {
        await customersApi.update(session.token, editingCustomer.id, payload);
      } else {
        await customersApi.create(session.token, payload);
      }
      setModalOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (customer: Customer) => {
    if (!session?.token || !window.confirm(`Excluir o cliente "${customer.name}"?`)) {
      return;
    }
    try {
      await customersApi.remove(session.token, customer.id);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir cliente.");
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Clientes"
        description="Cadastro e manutenção dos clientes usados nas corridas e pagamentos fora de app."
        action={
          <div className="button-row">
            <button className="secondary-button" onClick={() => void load()} type="button">
              Atualizar lista
            </button>
            <button className="primary-button" onClick={openCreate} type="button">
              Novo cliente
            </button>
          </div>
        }
      />

      <Panel title="Base de clientes" subtitle="Mesmas operações de cadastrar, editar e excluir disponíveis no app">
        {loading ? <DataState message="Carregando clientes..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && customers.length === 0 ? <DataState message="Nenhum cliente cadastrado." /> : null}
        {!loading && !error && customers.length > 0 ? (
          <div className="card-grid">
            {customers.map((customer) => (
              <article className="entity-card" key={customer.id}>
                <div className="entity-card-head">
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.email ?? "Sem e-mail"}</span>
                  </div>
                </div>
                <div className="detail-list">
                  <div>
                    <span>Telefone</span>
                    <strong>{customer.phone ?? "-"}</strong>
                  </div>
                  <div>
                    <span>Notas</span>
                    <strong>{customer.notes ?? "-"}</strong>
                  </div>
                </div>
                <div className="button-row">
                  <button className="secondary-button" onClick={() => openEdit(customer)} type="button">
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => void remove(customer)} type="button">
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
        title={editingCustomer ? "Editar cliente" : "Novo cliente"}
        subtitle="Somente nome é obrigatório. Telefone e e-mail são opcionais."
        onClose={() => setModalOpen(false)}
      >
        <div className="form-grid">
          <label className="field">
            <span>Nome</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="field">
            <span>Telefone</span>
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="field field-full">
            <span>Observações</span>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={4} />
          </label>
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setModalOpen(false)} type="button">
            Cancelar
          </button>
          <button className="primary-button" disabled={saving} onClick={() => void submit()} type="button">
            {saving ? "Salvando..." : editingCustomer ? "Atualizar cliente" : "Criar cliente"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
