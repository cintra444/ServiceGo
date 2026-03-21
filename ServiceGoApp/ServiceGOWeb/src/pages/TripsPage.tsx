import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { tripsApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Trip } from "../types/api";
import { currency, dateTime } from "../utils/format";

export function TripsPage() {
  const { session } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
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
        setTrips(await tripsApi.list(session.token));
      } catch (nextError) {
        setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar corridas.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.token]);

  return (
    <div className="page-stack">
      <PageHeader title="Corridas" description="Acompanhamento das viagens registradas no ServiceGO." />
      <Panel title="Lista de corridas" subtitle="Consulta web conectada ao backend do app">
        {loading ? <DataState message="Carregando corridas..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && trips.length === 0 ? <DataState message="Nenhuma corrida cadastrada." /> : null}
        {!loading && !error && trips.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rota</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Status</th>
                  <th>Início</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <strong>
                        {trip.origin} → {trip.destination}
                      </strong>
                    </td>
                    <td>{trip.customerName ?? "-"}</td>
                    <td>{trip.veiculoModelo ?? trip.veiculoPlaca ?? "-"}</td>
                    <td>{trip.status}</td>
                    <td>{dateTime(trip.startAt)}</td>
                    <td>{currency(trip.actualAmount ?? trip.estimatedAmount)}</td>
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
