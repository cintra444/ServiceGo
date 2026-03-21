import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { expenseCategoryLabels, paymentMethodLabels, paymentStatusLabels } from "../constants/labels";
import { customersApi, expensesApi, paymentsApi, relatoriosApi, tripsApi, veiculosApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { Customer, Expense, ExpenseCategory, Payment, PaymentMethod, PaymentStatus, RelatorioFinanceiro, Trip, Veiculo } from "../types/api";
import { cleanText, currency, dateTime, parseNumber, toIsoFromPtBr, toOffsetIso, toPtBrDateTime } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";

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

  const load = async () => {
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
  };

  useEffect(() => {
    void load();
  }, [session?.token]);

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
      amount: String(payment.amount ?? ""),
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
      amount: String(expense.amount ?? ""),
      description: expense.description ?? "",
      occurredAt: toPtBrDateTime(expense.occurredAt),
    });
    setExpenseModalOpen(true);
  };

  const savePayment = async () => {
    if (!session?.token) {
      return;
    }
    const amount = parseNumber(paymentForm.amount);
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
    const amount = parseNumber(expenseForm.amount);
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
              Atualizar
            </button>
            <button className="secondary-button" onClick={openPaymentCreate} type="button">
              Novo pagamento
            </button>
            <button className="primary-button" onClick={openExpenseCreate} type="button">
              Nova despesa
            </button>
          </div>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Receitas" value={currency(totals.receita)} tone="success" />
        <StatCard label="Despesas" value={currency(totals.custo)} tone="danger" />
        <StatCard label="Saldo" value={currency(totals.saldo)} />
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
              <input value={inicio} onChange={(event) => setInicio(event.target.value)} placeholder="01/03/2026" />
            </label>
            <label className="field">
              <span>Data final</span>
              <input value={fim} onChange={(event) => setFim(event.target.value)} placeholder="31/03/2026" />
            </label>
          </div>
          <div className="button-row">
            <button className="primary-button" disabled={loadingReport} onClick={() => void loadReport()} type="button">
              {loadingReport ? "Gerando..." : "Gerar relatório"}
            </button>
          </div>
          {relatorio ? (
            <div className="detail-grid">
              <div><span>Período</span><strong>{dateTime(relatorio.periodoInicio)} até {dateTime(relatorio.periodoFim)}</strong></div>
              <div><span>Total de corridas</span><strong>{relatorio.totalCorridas}</strong></div>
              <div><span>KM total</span><strong>{Number(relatorio.kmTotal ?? 0).toFixed(2)} km</strong></div>
              <div><span>Receita total</span><strong>{currency(relatorio.receitaTotal)}</strong></div>
              <div><span>Custos variáveis</span><strong>{currency(relatorio.custosVariaveisTotal)}</strong></div>
              <div><span>Depreciação</span><strong>{currency(relatorio.depreciacaoTotalPeriodo)}</strong></div>
              <div><span>Custo operacional total</span><strong>{currency(relatorio.custoOperacionalTotal)}</strong></div>
              <div><span>Custo operacional por km</span><strong>{currency(relatorio.custoOperacionalPorKm)}</strong></div>
              <div><span>Lucro total</span><strong>{currency(relatorio.lucroTotal)}</strong></div>
              <div><span>Lucro por km</span><strong>{currency(relatorio.lucroPorKm)}</strong></div>
              <div><span>Lucro por corrida</span><strong>{currency(relatorio.lucroPorCorrida)}</strong></div>
              <div><span>Lucro por dia</span><strong>{currency(relatorio.lucroPorDia)}</strong></div>
              <div><span>Lucro por mês</span><strong>{currency(relatorio.lucroPorMes)}</strong></div>
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
                <strong>{currency(payment.amount)} - {paymentMethodLabels[payment.method]}</strong>
                <span>{paymentStatusLabels[payment.status]} • {dateTime(payment.paidAt ?? payment.dueAt)}</span>
              </div>
              <div className="button-row">
                <button className="secondary-button" onClick={() => openPaymentEdit(payment)} type="button">Editar</button>
                <button className="danger-button" onClick={() => void removePayment(payment)} type="button">Excluir</button>
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
                <strong>{currency(expense.amount)} - {expenseCategoryLabels[expense.category]}</strong>
                <span>{expense.veiculoPlaca ?? `ID ${expense.veiculoId}`} • {dateTime(expense.occurredAt)}</span>
              </div>
              <div className="button-row">
                <button className="secondary-button" onClick={() => openExpenseEdit(expense)} type="button">Editar</button>
                <button className="danger-button" onClick={() => void removeExpense(expense)} type="button">Excluir</button>
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
          <label className="field"><span>Valor</span><input value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} /></label>
          <label className="field">
            <span>Pagamento parcial</span>
            <select value={paymentForm.pagamentoParcial} onChange={(event) => setPaymentForm({ ...paymentForm, pagamentoParcial: event.target.value })}>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </label>
          <label className="field"><span>Número da parcela</span><input value={paymentForm.numeroParcela} onChange={(event) => setPaymentForm({ ...paymentForm, numeroParcela: event.target.value })} /></label>
          <label className="field"><span>Pago em</span><input value={paymentForm.paidAt} onChange={(event) => setPaymentForm({ ...paymentForm, paidAt: event.target.value })} /></label>
          <label className="field"><span>Vence em</span><input value={paymentForm.dueAt} onChange={(event) => setPaymentForm({ ...paymentForm, dueAt: event.target.value })} /></label>
          <label className="field"><span>Código de referência</span><input value={paymentForm.referenceCode} onChange={(event) => setPaymentForm({ ...paymentForm, referenceCode: event.target.value })} /></label>
          <label className="field field-full"><span>Observações</span><textarea rows={3} value={paymentForm.notes} onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })} /></label>
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setPaymentModalOpen(false)} type="button">Cancelar</button>
          <button className="primary-button" disabled={saving} onClick={() => void savePayment()} type="button">{saving ? "Salvando..." : editingPayment ? "Atualizar pagamento" : "Criar pagamento"}</button>
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
          <label className="field"><span>Valor</span><input value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} /></label>
          <label className="field"><span>Data da despesa</span><input value={expenseForm.occurredAt} onChange={(event) => setExpenseForm({ ...expenseForm, occurredAt: event.target.value })} /></label>
          <label className="field field-full"><span>Descrição</span><textarea rows={3} value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} /></label>
        </div>
        <div className="button-row modal-actions">
          <button className="secondary-button" onClick={() => setExpenseModalOpen(false)} type="button">Cancelar</button>
          <button className="primary-button" disabled={saving} onClick={() => void saveExpense()} type="button">{saving ? "Salvando..." : editingExpense ? "Atualizar despesa" : "Criar despesa"}</button>
        </div>
      </Modal>
    </div>
  );
}
