import { apiRequest } from "./apiClient";
import type {
  Agendamento,
  ConfiguracaoUsuario,
  Customer,
  Expense,
  LoginRequest,
  LoginResponse,
  Payment,
  Trip,
  Veiculo,
} from "../types/api";

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<LoginResponse>("/api/auth/login", { method: "POST", body: payload });
  },
  mePlan(token: string) {
    return apiRequest<LoginResponse["plan"]>("/api/auth/me/plan", { token });
  },
};

export const tripsApi = {
  list(token: string) {
    return apiRequest<Trip[]>("/api/trips", { token });
  },
};

export const customersApi = {
  list(token: string) {
    return apiRequest<Customer[]>("/api/customers", { token });
  },
};

export const veiculosApi = {
  list(token: string) {
    return apiRequest<Veiculo[]>("/api/veiculos", { token });
  },
};

export const paymentsApi = {
  list(token: string) {
    return apiRequest<Payment[]>("/api/payments", { token });
  },
};

export const expensesApi = {
  list(token: string) {
    return apiRequest<Expense[]>("/api/expenses", { token });
  },
};

export const agendamentosApi = {
  list(token: string) {
    return apiRequest<Agendamento[]>("/api/agendamentos", { token });
  },
};

export const configuracaoApi = {
  get(token: string, usuarioId: number) {
    return apiRequest<ConfiguracaoUsuario>(`/api/configuracoes-usuario/${usuarioId}`, { token });
  },
};
