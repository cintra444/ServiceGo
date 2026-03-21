import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { veiculosApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Veiculo } from "../types/api";

export function VehiclesPage() {
  const { session } = useAuth();
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
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
        setVehicles(await veiculosApi.list(session.token));
      } catch (nextError) {
        setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar veículos.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.token]);

  return (
    <div className="page-stack">
      <PageHeader title="Veículos" description="Frota cadastrada para operação e controle." />
      <Panel title="Lista de veículos" subtitle="Situação atual da frota">
        {loading ? <DataState message="Carregando veículos..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && vehicles.length === 0 ? <DataState message="Nenhum veículo cadastrado." /> : null}
        {!loading && !error && vehicles.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Placa</th>
                  <th>Ano</th>
                  <th>KM atual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.modelo}</td>
                    <td>{vehicle.placa}</td>
                    <td>{vehicle.ano}</td>
                    <td>{vehicle.kmAtual}</td>
                    <td>{vehicle.ativo ? "Ativo" : "Inativo"}</td>
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
