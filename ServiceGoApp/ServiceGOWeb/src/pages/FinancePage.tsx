import { useCallback, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { PickerInput } from "../components/PickerInput";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { expenseCategoryLabels, paymentMethodLabels, paymentStatusLabels } from "../constants/labels";
import { customersApi, expensesApi, paymentsApi, relatoriosApi, tripsApi, veiculosApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Customer, Expense, ExpenseCategory, Payment, PaymentMethod, PaymentStatus, RelatorioFinanceiro, Trip, Veiculo } from "../types/api";
import { cleanText, currency, dateTime, formatCurrencyInput, parseCurrencyInput, parseNumber, toIsoFromPtBr, toOffsetIso, toPtBrDateTime } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";
import { subscribeDataRefresh } from "../utils/dataRefresh";

function FinanceIcon({
  kind,
}: {
  kind:
    | "refresh"
    | "payment"
    | "expense"
    | "revenue"
    | "cost"
    | "balance"
    | "report"
    | "vehicle"
    | "calendar"
    | "money"
    | "method"
    | "status"
    | "edit"
    | "trash";
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
    payment: (
      <>
        <rect x="4.5" y="6.5" width="15" height="11" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 10.3h15" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
    expense: (
      <>
        <path
          d="M7 5.5h10c1 0 1.8.8 1.8 1.8v9.4c0 1-.8 1.8-1.8 1.8H9.8L5.2 21v-3.5H7c-1 0-1.8-.8-1.8-1.8V7.3c0-1 .8-1.8 1.8-1.8Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M8.7 10.1h6.6M8.7 13.5h4.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    revenue: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M9 12.2c.6.9 1.6 1.4 3 1.4 1.6 0 2.7-.7 2.7-1.9 0-1.1-.8-1.7-2.5-2l-.5-.1c-1.8-.3-2.7-.9-2.7-2.1 0-1.4 1.3-2.4 3.2-2.4 1.3 0 2.3.4 3 1.2M12 7.2v9.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </>
    ),
    cost: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 12h7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    balance: (
      <>
        <path
          d="M5.5 15.5 9.7 11l2.7 2.7 6.1-6.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M14.7 7.5h3.8v3.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    report: (
      <>
        <path
          d="M7 5h7l4 4v9.5c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8V6.8C6 5.8 6.8 5 7.8 5Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M14 5v4h4M9 13.4h6M9 16.8h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
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
    calendar: (
      <>
        <path
          d="M7 4.8v2.4M17 4.8v2.4M5.5 8.2h13M6.8 6.5h10.4c.9 0 1.6.7 1.6 1.6v9.9c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6V8.1c0-.9.7-1.6 1.6-1.6Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </>
    ),
    money: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v8M9 10.2c.6-.8 1.5-1.2 2.8-1.2 1.8 0 2.9.8 2.9 2 0 1-.7 1.7-2.4 2l-.7.1c-1.7.3-2.6 1-2.6 2.2 0 1.3 1.2 2.2 3 2.2 1.3 0 2.4-.4 3-1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      </>
    ),
    method: (
      <>
        <rect x="4.5" y="7" width="15" height="10" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="12" r="1.3" fill="currentColor" />
        <path d="M12 12h3.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    status: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.8 12 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4.3L19 9.3 14.7 5 4 15.7V20Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
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

const emptyPaymentForm = {
  tripId: "",
  customerId: "",
  method: "PIX" as PaymentMethod,
  status: "PENDENTE" as PaymentStatus,
  amount: "",
  pagamentoParcial: "false",
  numeroParcela: "",
  paidAt: "",
  dueAt: "",
  referenceCode: "",
  notes: "",
};

const emptyExpenseForm = {
  tripId: "",
  veiculoId: "",
  category: "COMBUSTIVEL" as ExpenseCategory,
  amount: "",
  description: "",
  occurredAt: toPtBrDateTime(new Date().toISOString()),
};

export function FinancePage() {
  const { session } = useAuth();
  const isPremium = hasPremiumAccess(session?.plan);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiro | null>(null);
  const [veiculoId, setVeiculoId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [nextPayments, nextExpenses, nextTrips, nextCustomers, nextVehicles] = await Promise.all([
        paymentsApi.list(session.token),
        expensesApi.list(session.token),
        tripsApi.list(session.token),
        customersApi.list(session.token),
        veiculosApi.list(session.token),
      ]);
      setPayments(nextPayments);
      setExpenses(nextExpenses);
      setTrips(nextTrips);
      setCustomers(nextCustomers);
      setVehicles(nextVehicles);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar financeiro.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => subscribeDataRefresh(() => {
    void load();
  }), [load]);

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [load]);

  const totals = useMemo(() => {
    const receita = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const custo = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
    return { receita, custo, saldo: receita - custo };
  }, [payments, expenses]);

  const openPaymentCreate = () => {
    setEditingPayment(null);
    setPaymentForm(emptyPaymentForm);
    setPaymentModalOpen(true);
  };

  const openPaymentEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      tripId: payment.tripId ? String(payment.tripId) : "",
      customerId: payment.customerId ? String(payment.customerId) : "",
      method: payment.method,
      status: payment.status,
      amount: payment.amount != null ? formatCurrencyInput(String(Math.round(Number(payment.amount) * 100))) : "",
      pagamentoParcial: payment.pagamentoParcial ? "true" : "false",
      numeroParcela: payment.numeroParcela ? String(payment.numeroParcela) : "",
      paidAt: toPtBrDateTime(payment.paidAt),
      dueAt: toPtBrDateTime(payment.dueAt),
      referenceCode: payment.referenceCode ?? "",
      notes: payment.notes ?? "",
    });
    setPaymentModalOpen(true);
  };

  const openExpenseCreate = () => {
    setEditingExpense(null);
    setExpenseForm(emptyExpenseForm);
    setExpenseModalOpen(true);
  };

  const openExpenseEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      tripId: expense.tripId ? String(expense.tripId) : "",
      veiculoId: String(expense.veiculoId ?? ""),
      category: expense.category,
      amount: expense.amount != null ? formatCurrencyInput(String(Math.round(Number(expense.amount) * 100))) : "",
      description: expense.description ?? "",
      occurredAt: toPtBrDateTime(expense.occurredAt),
    });
    setExpenseModalOpen(true);
  };

  const savePayment = async () => {
    if (!session?.token) {
      return;
    }
    const amount = parseCurrencyInput(paymentForm.amount);
    if (!amount) {
      setError("Informe um valor válido para o pagamento.");
      return;
    }
    const paidAt = toIsoFromPtBr(paymentForm.paidAt);
    const dueAt = toIsoFromPtBr(paymentForm.dueAt);
    if (paymentForm.paidAt.trim() && !paidAt) {
      setError("Data de pagamento inválida. Use DD/MM/AAAA HH:mm.");
      return;
    }
    if (paymentForm.dueAt.trim() && !dueAt) {
      setError("Data de vencimento inválida. Use DD/MM/AAAA HH:mm.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        tripId: paymentForm.tripId ? Number(paymentForm.tripId) : null,
        customerId: paymentForm.customerId ? Number(paymentForm.customerId) : null,
        method: paymentForm.method,
        status: paymentForm.status,
        amount,
        pagamentoParcial: paymentForm.pagamentoParcial === "true",
        numeroParcela: parseNumber(paymentForm.numeroParcela),
        paidAt,
        dueAt,
        referenceCode: cleanText(paymentForm.referenceCode),
        notes: cleanText(paymentForm.notes),
      };
      if (editingPayment?.id) {
        await paymentsApi.update(session.token, editingPayment.id, payload);
      } else {
        await paymentsApi.create(session.token, payload);
      }
      setPaymentModalOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível salvar pagamento.");
    } finally {
      setSaving(false);
    }
  };

  const saveExpense = async () => {
    if (!session?.token) {
      return;
    }
    const amount = parseCurrencyInput(expenseForm.amount);
    const veiculoIdValue = Number(expenseForm.veiculoId);
    const occurredAt = toIsoFromPtBr(expenseForm.occurredAt);
    if (!amount || !veiculoIdValue || !occurredAt) {
      setError("Informe veículo, valor e data válidos para a despesa.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        tripId: expenseForm.tripId ? Number(expenseForm.tripId) : null,
        veiculoId: veiculoIdValue,
        category: expenseForm.category,
        amount,
        description: cleanText(expenseForm.description),
        occurredAt,
      };
      if (editingExpense?.id) {
        await expensesApi.update(session.token, editingExpense.id, payload);
      } else {
        await expensesApi.create(session.token, payload);
      }
      setExpenseModalOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível salvar despesa.");
    } finally {
      setSaving(false);
    }
  };

  const removePayment = async (payment: Payment) => {
    if (!session?.token || !window.confirm(`Excluir o pagamento de ${currency(payment.amount)}?`)) {
      return;
    }
    try {
      await paymentsApi.remove(session.token, payment.id);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir pagamento.");
    }
  };

  const removeExpense = async (expense: Expense) => {
    if (!session?.token || !window.confirm(`Excluir a despesa de ${currency(expense.amount)}?`)) {
      return;
    }
    try {
      await expensesApi.remove(session.token, expense.id);
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível excluir despesa.");
    }
  };

  const loadReport = async () => {
    if (!session?.token || !session.userId) {
      return;
    }
    const inicioIso = inicio.trim() ? toOffsetIso(inicio) : undefined;
    const fimIso = fim.trim() ? toOffsetIso(fim, true) : undefined;
    if (inicio.trim() && !inicioIso) {
      setError("Data inicial inválida. Use DD/MM/AAAA.");
      return;
    }
    if (fim.trim() && !fimIso) {
      setError("Data final inválida. Use DD/MM/AAAA.");
      return;
    }
    try {
      setLoadingReport(true);
      setError(null);
      const data = await relatoriosApi.financeiro(session.token, {
        usuarioId: session.userId,
        veiculoId: veiculoId ? Number(veiculoId) : undefined,
        inicio: inicioIso,
        fim: fimIso,
      });
      setRelatorio(data);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível carregar o relatório financeiro.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Financeiro"
        description="Resumo, pagamentos, despesas e relatório consolidado da operação."
        action={
          <div className="button-row">
            <button className="secondary-button" onClick={() => void load()} type="button">
              <span className="button-icon" aria-hidden="true">
                <FinanceIcon kind="refresh" />
              </span>
              Atualizar
            </button>
            <button className="secondary-button" onClick={openPaymentCreate} type="button">
              <span className="button-icon" aria-hidden="true">
                <FinanceIcon kind="payment" />
              </span>
              Novo pagamento
            </button>
            <button className="primary-button" onClick={openExpenseCreate} type="button">
              <span className="button-icon" aria-hidden="true">
                <FinanceIcon kind="expense" />
              </span>
              Nova despesa
            </button>
          </div>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Receitas" value={currency(totals.receita)} tone="success" icon={<FinanceIcon kind="revenue" />} />
        <StatCard label="Despesas" value={currency(totals.custo)} tone="danger" icon={<FinanceIcon kind="cost" />} />
        <StatCard label="Saldo" value={currency(totals.saldo)} icon={<FinanceIcon kind="balance" />} />
      </div>

      {isPremium ? (
        <Panel title="Relatório financeiro" subtitle="Mesmo relatório premium disponível no app">
          <div className="form-grid compact-grid">
            <label className="field">
              <span>Veículo</span>
              <select value={veiculoId} onChange={(event) => setVeiculoId(event.target.value)}>
                <option value="">Todos</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.modelo}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Data inicial</span>
              <PickerInput value={inicio} onChange={setInicio} mode="date" placeholder="01/03/2026" />
            </label>
            <label className="field">
              <span>Data final</span>
              <PickerInput value={fim} onChange={setFim} mode="date" placeholder="31/03/2026" />
            </label>
          </div>
          <div className="button-row">
            <button className="primary-button" disabled={loadingReport} onClick={() => void loadReport()} type="button">
              <span className="button-icon" aria-hidden="true">
                <FinanceIcon kind="report" />
              </span>
              {loadingReport ? "Gerando..." : "Gerar relatório"}
            </button>
          </div>
          {relatorio ? (
            <div className="detail-grid">
              <div><span className="detail-label"><FinanceIcon kind="calendar" /> Período</span><strong>{dateTime(relatorio.periodoInicio)} até {dateTime(relatorio.periodoFim)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="report" /> Total de corridas</span><strong>{relatorio.totalCorridas}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="vehicle" /> KM total</span><strong>{Number(relatorio.kmTotal ?? 0).toFixed(2)} km</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="revenue" /> Receita total</span><strong>{currency(relatorio.receitaTotal)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="cost" /> Custos variáveis</span><strong>{currency(relatorio.custosVariaveisTotal)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="expense" /> Depreciação</span><strong>{currency(relatorio.depreciacaoTotalPeriodo)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="cost" /> Custo operacional total</span><strong>{currency(relatorio.custoOperacionalTotal)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="vehicle" /> Custo operacional por km</span><strong>{currency(relatorio.custoOperacionalPorKm)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="balance" /> Lucro total</span><strong>{currency(relatorio.lucroTotal)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="balance" /> Lucro por km</span><strong>{currency(relatorio.lucroPorKm)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="payment" /> Lucro por corrida</span><strong>{currency(relatorio.lucroPorCorrida)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="calendar" /> Lucro por dia</span><strong>{currency(relatorio.lucroPorDia)}</strong></div>
              <div><span className="detail-label"><FinanceIcon kind="calendar" /> Lucro por mês</span><strong>{currency(relatorio.lucroPorMes)}</strong></div>
            </div>
          ) : (
            <DataState message="Carregue o relatório para exibir os indicadores consolidados." />
          )}
        </Panel>
      ) : (
        <Panel title="Relatório financeiro" subtitle="Disponível para plano Pro">
          <DataState message="A versão web também respeita o bloqueio premium do relatório consolidado." />
        </Panel>
      )}

      <div className="two-column-grid">
        <Panel title="Pagamentos" subtitle="Criar, editar e excluir pagamentos">
          {loading ? <DataState message="Carregando pagamentos..." /> : null}
          {!loading && payments.length === 0 ? <DataState message="Sem pagamentos." /> : null}
          {payments.map((payment) => (
            <div className="list-row" key={payment.id}>
              <div>
                <strong className="list-title-with-icon">
                  <span className="list-title-icon" aria-hidden="true">
                    <FinanceIcon kind="payment" />
                  </span>
                  <span>{currency(payment.amount)} - {paymentMethodLabels[payment.method]}</span>
                </strong>
                <span className="list-meta-with-icons">
                  <span className="detail-label"><FinanceIcon kind="status" /> {paymentStatusLabels[payment.status]}</span>
                  <span className="detail-label"><FinanceIcon kind="calendar" /> {dateTime(payment.paidAt ?? payment.dueAt)}</span>
                </span>
              </div>
              <div className="button-row">
                <button className="secondary-button" onClick={() => openPaymentEdit(payment)} type="button">
                  <span className="button-icon" aria-hidden="true">
                    <FinanceIcon kind="edit" />
                  </span>
                  Editar
                </button>
                <button className="danger-button" onClick={() => void removePayment(payment)} type="button">
                  <span className="button-icon" aria-hidden="true">
                    <FinanceIcon kind="trash" />
                  </span>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Despesas" subtitle="Criar, editar e excluir despesas">
          {loading ? <DataState message="Carregando despesas..." /> : null}
          {!loading && expenses.length === 0 ? <DataState message="Sem despesas." /> : null}
          {expenses.map((expense) => (
            <div className="list-row" key={expense.id}>
              <div>
                <strong className="list-title-with-icon">
                  <span className="list-title-icon" aria-hidden="true">
                    <FinanceIcon kind="expense" />
                  </span>
                  <span>{currency(expense.amount)} - {expenseCategoryLabels[expense.category]}</span>
                </strong>
                <span className="list-meta-with-icons">
                  <span className="detail-label"><FinanceIcon kind="vehicle" /> {expense.veiculoPlaca ?? `ID ${expense.veiculoId}`}</span>
                  <span className="detail-label"><FinanceIcon kind="calendar" /> {dateTime(expense.occurredAt)}</span>
                </span>
              </div>
              <div className="button-row">
                <button className="secondary-button" onClick={() => openExpenseEdit(expense)} type="button">
                  <span className="button-icon" aria-hidden="true">
                    <FinanceIcon kind="edit" />
                  </span>
                  Editar
                </button>
                <button className="danger-button" onClick={() => void removeExpense(expense)} type="button">
                  <span className="button-icon" aria-hidden="true">
                    <FinanceIcon kind="trash" />
                  </span>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <Modal open={paymentModalOpen} title={editingPayment ? "Editar pagamento" : "Novo pagamento"} onClose={() => setPaymentModalOpen(false)}>
        <div className="form-grid">
          <label className="field">
            <span>Corrida</span>
            <select value={paymentForm.tripId} onChange={(event) => setPaymentForm({ ...paymentForm, tripId: event.target.value })}>
              <option value="">Nenhuma</option>
              {trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.origin} - {trip.destination}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Cliente</span>
            <select value={paymentForm.customerId} onChange={(event) => setPaymentForm({ ...paymentForm, customerId: event.target.value })}>
              <option value="">Nenhum</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Método</span>
            <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value as PaymentMethod })}>
              {Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={paymentForm.status} onChange={(event) => setPaymentForm({ ...paymentForm, status: event.target.value as PaymentStatus })}>
              {Object.entries(paymentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field"><span>Valor</span><input className="money-input" inputMode="decimal" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: formatCurrencyInput(event.target.value) })} placeholder="R$ 0,00" /></label>
          <label className="field">
            <span>Pagamento parcial</span>
            <select value={paymentForm.pagamentoParcial} onChange={(event) => setPaymentForm({ ...paymentForm, pagamentoParcial: event.target.value })}>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </label>
          <label className="field"><span>Número da parcela</span><input value={paymentForm.numeroParcela} onChange={(event) => setPaymentForm({ ...paymentForm, numeroParcela: event.target.value })} /></label>
          <label className="field"><span>Pago em</span><PickerInput value={paymentForm.paidAt} onChange={(value) => setPaymentForm({ ...paymentForm, paidAt: value })} mode="datetime" placeholder="DD/MM/AAAA HH:mm" /></label>
          <label className="field"><span>Vence em</span><PickerInput value={paymentForm.dueAt} onChange={(value) => setPaymentForm({ ...paymentForm, dueAt: value })} mode="datetime" placeholder="DD/MM/AAAA HH:mm" /></label>
          <label className="field"><span>Código de referência</span><input value={paymentForm.referenceCode} onChange={(event) => setPaymentForm({ ...paymentForm, referenceCode: event.target.value })} /></label>
          <label className="field field-full"><span>Observações</span><textarea rows={3} value={paymentForm.notes} onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })} /></label>
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setPaymentModalOpen(false)} type="button">Cancelar</button>
          <button className="primary-button" disabled={saving} onClick={() => void savePayment()} type="button">
            <span className="button-icon" aria-hidden="true">
              <FinanceIcon kind={editingPayment ? "edit" : "payment"} />
            </span>
            {saving ? "Salvando..." : editingPayment ? "Atualizar pagamento" : "Criar pagamento"}
          </button>
        </div>
      </Modal>

      <Modal open={expenseModalOpen} title={editingExpense ? "Editar despesa" : "Nova despesa"} onClose={() => setExpenseModalOpen(false)}>
        <div className="form-grid">
          <label className="field">
            <span>Corrida</span>
            <select value={expenseForm.tripId} onChange={(event) => setExpenseForm({ ...expenseForm, tripId: event.target.value })}>
              <option value="">Nenhuma</option>
              {trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.origin} - {trip.destination}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Veículo</span>
            <select value={expenseForm.veiculoId} onChange={(event) => setExpenseForm({ ...expenseForm, veiculoId: event.target.value })}>
              <option value="">Selecione</option>
              {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.placa} - {vehicle.modelo}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Categoria</span>
            <select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value as ExpenseCategory })}>
              {Object.entries(expenseCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field"><span>Valor</span><input className="money-input" inputMode="decimal" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: formatCurrencyInput(event.target.value) })} placeholder="R$ 0,00" /></label>
          <label className="field"><span>Data da despesa</span><PickerInput value={expenseForm.occurredAt} onChange={(value) => setExpenseForm({ ...expenseForm, occurredAt: value })} mode="datetime" placeholder="DD/MM/AAAA HH:mm" /></label>
          <label className="field field-full"><span>Descrição</span><textarea rows={3} value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} /></label>
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setExpenseModalOpen(false)} type="button">Cancelar</button>
          <button className="primary-button" disabled={saving} onClick={() => void saveExpense()} type="button">
            <span className="button-icon" aria-hidden="true">
              <FinanceIcon kind={editingExpense ? "edit" : "expense"} />
            </span>
            {saving ? "Salvando..." : editingExpense ? "Atualizar despesa" : "Criar despesa"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
