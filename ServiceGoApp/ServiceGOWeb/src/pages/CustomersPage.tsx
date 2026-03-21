import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { customersApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Customer } from "../types/api";

export function CustomersPage() {
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    const load = async () => {
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

    void load();
  }, [session?.token]);

  return (
    <div className="page-stack">
      <PageHeader title="Clientes" description="Base de passageiros cadastrados no sistema." />
      <Panel title="Cadastros" subtitle="Consulta rápida dos contatos disponíveis">
        {loading ? <DataState message="Carregando clientes..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && customers.length === 0 ? <DataState message="Nenhum cliente cadastrado." /> : null}
        {!loading && !error && customers.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone ?? "-"}</td>
                    <td>{customer.email ?? "-"}</td>
                    <td>{customer.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
