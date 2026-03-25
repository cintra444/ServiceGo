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

function CustomerIcon({
  kind,
}: {
  kind: "refresh" | "plus" | "customer" | "phone" | "note" | "edit" | "trash";
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
    customer: (
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
    phone: (
      <path
        d="M8.3 5.6c.5-.5 1.2-.6 1.8-.3l1.8.9c.6.3.9 1 .7 1.7l-.5 1.8a1 1 0 0 0 .3 1l1.7 1.7a1 1 0 0 0 1 .3l1.8-.5c.7-.2 1.4.1 1.7.7l.9 1.8c.3.6.2 1.3-.3 1.8l-1.2 1.2c-.8.8-1.9 1.1-3 .8-2.3-.6-4.4-1.8-6.2-3.6-1.8-1.8-3-3.9-3.6-6.2-.3-1.1 0-2.2.8-3l1.1-1.1Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    note: (
      <>
        <path
          d="M7 5.5h10c1 0 1.8.8 1.8 1.8v9.4c0 1-.8 1.8-1.8 1.8H9.8L5.2 21v-3.5H7c-1 0-1.8-.8-1.8-1.8V7.3c0-1 .8-1.8 1.8-1.8Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M8.8 10h6.4M8.8 13.4h4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
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
              <span className="button-icon" aria-hidden="true">
                <CustomerIcon kind="refresh" />
              </span>
              Atualizar lista
            </button>
            <button className="primary-button" onClick={openCreate} type="button">
              <span className="button-icon" aria-hidden="true">
                <CustomerIcon kind="plus" />
              </span>
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
                    <strong className="entity-card-title">
                      <span className="entity-card-icon" aria-hidden="true">
                        <CustomerIcon kind="customer" />
                      </span>
                      <span>{customer.name}</span>
                    </strong>
                    <span>{customer.email ?? "Sem e-mail"}</span>
                  </div>
                </div>
                <div className="detail-list">
                  <div>
                    <span className="detail-label">
                      <CustomerIcon kind="phone" /> Telefone
                    </span>
                    <strong>{customer.phone ?? "-"}</strong>
                  </div>
                  <div>
                    <span className="detail-label">
                      <CustomerIcon kind="note" /> Notas
                    </span>
                    <strong>{customer.notes ?? "-"}</strong>
                  </div>
                </div>
                <div className="button-row">
                  <button className="secondary-button" onClick={() => openEdit(customer)} type="button">
                    <span className="button-icon" aria-hidden="true">
                      <CustomerIcon kind="edit" />
                    </span>
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => void remove(customer)} type="button">
                    <span className="button-icon" aria-hidden="true">
                      <CustomerIcon kind="trash" />
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
            <span className="button-icon" aria-hidden="true">
              <CustomerIcon kind={editingCustomer ? "edit" : "plus"} />
            </span>
            {saving ? "Salvando..." : editingCustomer ? "Atualizar cliente" : "Criar cliente"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
