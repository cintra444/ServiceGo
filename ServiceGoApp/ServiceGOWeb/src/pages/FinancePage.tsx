import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { expensesApi, paymentsApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Expense, Payment } from "../types/api";
import { currency, dateOnly } from "../utils/format";

export function FinancePage() {
  const { session } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
        const [nextPayments, nextExpenses] = await Promise.all([
          paymentsApi.list(session.token),
          expensesApi.list(session.token),
        ]);
        setPayments(nextPayments);
        setExpenses(nextExpenses);
      } catch (nextError) {
        setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar dados financeiros.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.token]);

  const totals = useMemo(() => {
    const receita = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const custo = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
    return {
      receita,
      custo,
      saldo: receita - custo,
    };
  }, [payments, expenses]);

  return (
    <div className="page-stack">
      <PageHeader title="Financeiro" description="Receitas, despesas e saldo operacional." />
      {loading ? <DataState message="Carregando financeiro..." /> : null}
      {error ? <div className="error-banner">{error}</div> : null}
      {!loading && !error ? (
        <>
          <div className="stats-grid">
            <StatCard label="Receita total" value={currency(totals.receita)} tone="success" />
            <StatCard label="Despesa total" value={currency(totals.custo)} tone="danger" />
            <StatCard label="Saldo operacional" value={currency(totals.saldo)} />
          </div>

          <div className="two-column-grid">
            <Panel title="Pagamentos" subtitle="Últimos recebimentos e cobranças">
              {payments.slice(0, 8).map((payment) => (
                <div className="list-row" key={payment.id}>
                  <div>
                    <strong>{payment.status}</strong>
                    <span>{dateOnly(payment.paidAt ?? payment.dueAt)}</span>
                  </div>
                  <strong>{currency(payment.amount)}</strong>
                </div>
              ))}
              {payments.length === 0 ? <DataState message="Nenhum pagamento registrado." /> : null}
            </Panel>

            <Panel title="Despesas" subtitle="Saídas registradas">
              {expenses.slice(0, 8).map((expense) => (
                <div className="list-row" key={expense.id}>
                  <div>
                    <strong>{expense.category}</strong>
                    <span>{dateOnly(expense.occurredAt)}</span>
                  </div>
                  <strong>{currency(expense.amount)}</strong>
                </div>
              ))}
              {expenses.length === 0 ? <DataState message="Nenhuma despesa registrada." /> : null}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
