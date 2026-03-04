import { apiRequest } from "./apiClient";
import type {
  Agendamento,
  AgendamentoRequest,
  ConfiguracaoUsuario,
  ConfiguracaoUsuarioRequest,
  Customer,
  CustomerRequest,
  Expense,
  ExpenseRequest,
  LoginRequest,
  LoginResponse,
  Payment,
  PaymentRequest,
  Trip,
  TripRequest,
  Veiculo,
  VeiculoRequest,
} from "../types/api";

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<LoginResponse>("/api/auth/login", { method: "POST", body: payload });
  },
  changePassword(token: string, currentPassword: string, newPassword: string) {
    return apiRequest<void>("/api/auth/change-password", {
      method: "POST",
      token,
      body: { currentPassword, newPassword },
    });
  },
};

export const customersApi = {
  list(token: string) {
    return apiRequest<Customer[]>("/api/customers", { token });
  },
  create(token: string, payload: CustomerRequest) {
    return apiRequest<Customer>("/api/customers", { method: "POST", token, body: payload });
  },
  update(token: string, id: number, payload: CustomerRequest) {
    return apiRequest<Customer>(`/api/customers/${id}`, { method: "PUT", token, body: payload });
  },
  remove(token: string, id: number) {
    return apiRequest<void>(`/api/customers/${id}`, { method: "DELETE", token });
  },
};

export const veiculosApi = {
  list(token: string) {
    return apiRequest<Veiculo[]>("/api/veiculos", { token });
  },
  create(token: string, payload: VeiculoRequest) {
    return apiRequest<Veiculo>("/api/veiculos", { method: "POST", token, body: payload });
  },
  update(token: string, id: number, payload: VeiculoRequest) {
    return apiRequest<Veiculo>(`/api/veiculos/${id}`, { method: "PUT", token, body: payload });
  },
  remove(token: string, id: number) {
    return apiRequest<void>(`/api/veiculos/${id}`, { method: "DELETE", token });
  },
};

export const tripsApi = {
  list(token: string) {
    return apiRequest<Trip[]>("/api/trips", { token });
  },
  create(token: string, payload: TripRequest) {
    return apiRequest<Trip>("/api/trips", { method: "POST", token, body: payload });
  },
  update(token: string, id: number, payload: TripRequest) {
    return apiRequest<Trip>(`/api/trips/${id}`, { method: "PUT", token, body: payload });
  },
  remove(token: string, id: number) {
    return apiRequest<void>(`/api/trips/${id}`, { method: "DELETE", token });
  },
};

export const paymentsApi = {
  list(token: string) {
    return apiRequest<Payment[]>("/api/payments", { token });
  },
  create(token: string, payload: PaymentRequest) {
    return apiRequest<Payment>("/api/payments", { method: "POST", token, body: payload });
  },
  update(token: string, id: number, payload: PaymentRequest) {
    return apiRequest<Payment>(`/api/payments/${id}`, { method: "PUT", token, body: payload });
  },
  remove(token: string, id: number) {
    return apiRequest<void>(`/api/payments/${id}`, { method: "DELETE", token });
  },
};

export const expensesApi = {
  list(token: string) {
    return apiRequest<Expense[]>("/api/expenses", { token });
  },
  create(token: string, payload: ExpenseRequest) {
    return apiRequest<Expense>("/api/expenses", { method: "POST", token, body: payload });
  },
  update(token: string, id: number, payload: ExpenseRequest) {
    return apiRequest<Expense>(`/api/expenses/${id}`, { method: "PUT", token, body: payload });
  },
  remove(token: string, id: number) {
    return apiRequest<void>(`/api/expenses/${id}`, { method: "DELETE", token });
  },
};

export const agendamentosApi = {
  list(token: string) {
    return apiRequest<Agendamento[]>("/api/agendamentos", { token });
  },
  create(token: string, payload: AgendamentoRequest) {
    return apiRequest<Agendamento>("/api/agendamentos", { method: "POST", token, body: payload });
  },
  update(token: string, id: number, payload: AgendamentoRequest) {
    return apiRequest<Agendamento>(`/api/agendamentos/${id}`, {
      method: "PUT",
      token,
      body: payload,
    });
  },
  remove(token: string, id: number) {
    return apiRequest<void>(`/api/agendamentos/${id}`, { method: "DELETE", token });
  },
};

export const configuracaoApi = {
  get(token: string, usuarioId: number) {
    return apiRequest<ConfiguracaoUsuario>(`/api/configuracoes-usuario/${usuarioId}`, { token });
  },
  update(token: string, usuarioId: number, payload: ConfiguracaoUsuarioRequest) {
    return apiRequest<ConfiguracaoUsuario>(`/api/configuracoes-usuario/${usuarioId}`, {
      method: "PUT",
      token,
      body: payload,
    });
  },
};
