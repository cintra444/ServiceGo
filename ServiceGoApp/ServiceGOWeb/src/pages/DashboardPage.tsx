import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { expensesApi, paymentsApi, tripsApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Expense, Payment, Trip } from "../types/api";
import { currency, dateOnly } from "../utils/format";

interface DashboardData {
  trips: Trip[];
  payments: Payment[];
  expenses: Expense[];
}

function DashboardIcon({ kind }: { kind: "trips" | "progress" | "revenue" | "costs" }) {
  const icons = {
    trips: (
      <path
        d="M4.5 15.5h15m-12.8 0 1.1-6.2c.12-.69.18-1.03.37-1.28.17-.23.4-.41.67-.53.3-.14.66-.14 1.38-.14h3.5c.72 0 1.08 0 1.38.14.27.12.5.3.67.53.19.25.25.59.37 1.28l1.1 6.2M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    progress: (
      <path
        d="M12 5.2a6.8 6.8 0 1 0 6.8 6.8m-2.4-4.4-4 4-2-2m1.6-6.6h6.4V9"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    revenue: (
      <path
        d="M6 17.5V10m6 7.5V6.5m6 11V12M4.5 19.5h15"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    costs: (
      <path
        d="M5 6.5h14m-2 0-1.2 12H8.2L7 6.5m3-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

export function DashboardPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({ trips: [], payments: [], expenses: [] });

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [trips, payments, expenses] = await Promise.all([
          tripsApi.list(session.token),
          paymentsApi.list(session.token),
          expensesApi.list(session.token),
        ]);
        setData({ trips, payments, expenses });
      } catch (nextError) {
        setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar indicadores.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.token]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const tripsToday = data.trips.filter((trip) => trip.startAt?.slice(0, 10) === today).length;
    const inProgress = data.trips.filter((trip) => trip.status === "EM_ANDAMENTO").length;
    const monthlyRevenue = data.payments
      .filter((payment) => {
        const reference = payment.paidAt ?? payment.dueAt;
        if (!reference) {
          return false;
        }
        const date = new Date(reference);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const monthlyCosts = data.expenses
      .filter((expense) => {
        const date = new Date(expense.occurredAt);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);

    return {
      tripsToday,
      inProgress,
      monthlyRevenue,
      monthlyCosts,
      monthlyBalance: monthlyRevenue - monthlyCosts,
    };
  }, [data]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Painel"
        description={`Visão rápida da operação. Atualizado em ${dateOnly(new Date().toISOString())}.`}
      />

      {loading ? <DataState message="Carregando indicadores..." /> : null}
      {error ? <div className="error-banner">{error}</div> : null}

      {!loading && !error ? (
        <>
          <div className="stats-grid">
            <StatCard label="Corridas hoje" value={String(metrics.tripsToday)} icon={<DashboardIcon kind="trips" />} />
            <StatCard label="Em andamento" value={String(metrics.inProgress)} icon={<DashboardIcon kind="progress" />} />
            <StatCard
              label="Receita do mês"
              value={currency(metrics.monthlyRevenue)}
              tone="success"
              icon={<DashboardIcon kind="revenue" />}
            />
            <StatCard
              label="Despesas do mês"
              value={currency(metrics.monthlyCosts)}
              tone="danger"
              icon={<DashboardIcon kind="costs" />}
            />
          </div>

          <Panel title="Saldo estimado do mês" subtitle="Receitas menos despesas registradas no período atual">
            <div className="balance-value">{currency(metrics.monthlyBalance)}</div>
          </Panel>

          <div className="two-column-grid">
            <Panel title="Últimas corridas" subtitle="As cinco movimentações mais recentes">
              {data.trips.slice(0, 5).map((trip) => (
                <div className="list-row" key={trip.id}>
                  <div>
                    <strong>
                      {trip.origin} → {trip.destination}
                    </strong>
                    <span>{dateOnly(trip.startAt)}</span>
                  </div>
                  <span className={`status-pill status-${trip.status.toLowerCase()}`}>{trip.status}</span>
                </div>
              ))}
              {data.trips.length === 0 ? <DataState message="Nenhuma corrida cadastrada." /> : null}
            </Panel>

            <Panel title="Pagamentos recentes" subtitle="Entradas registradas no sistema">
              {data.payments.slice(0, 5).map((payment) => (
                <div className="list-row" key={payment.id}>
                  <div>
                    <strong>{payment.method}</strong>
                    <span>{dateOnly(payment.paidAt ?? payment.dueAt)}</span>
                  </div>
                  <strong>{currency(payment.amount)}</strong>
                </div>
              ))}
              {data.payments.length === 0 ? <DataState message="Nenhum pagamento registrado." /> : null}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
