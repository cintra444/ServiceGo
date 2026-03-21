import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { agendamentosApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Agendamento } from "../types/api";
import { dateTime } from "../utils/format";

export function SchedulePage() {
  const { session } = useAuth();
  const [events, setEvents] = useState<Agendamento[]>([]);
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
        setEvents(await agendamentosApi.list(session.token));
      } catch (nextError) {
        setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar agenda.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.token]);

  return (
    <div className="page-stack">
      <PageHeader title="Agenda" description="Compromissos sincronizados e lembretes da operação." />
      <Panel title="Próximos eventos" subtitle="Agenda disponível no backend">
        {loading ? <DataState message="Carregando agenda..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && events.length === 0 ? <DataState message="Nenhum agendamento registrado." /> : null}
        {!loading && !error && events.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Local</th>
                  <th>Início</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.titulo}</td>
                    <td>{event.localEvento ?? "-"}</td>
                    <td>{dateTime(event.inicioEm)}</td>
                    <td>{event.status}</td>
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
