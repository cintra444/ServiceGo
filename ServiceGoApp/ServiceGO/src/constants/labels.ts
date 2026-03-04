import type {
  ExpenseCategory,
  PaymentMethod,
  PaymentStatus,
  StatusAgendamento,
  TripStatus,
  TripType,
} from "../types/api";

export const tripTypeLabels: Record<TripType, string> = {
  TRASLADO_AEROPORTO: "Traslado aeroporto",
  INTERMUNICIPAL: "Intermunicipal",
  LOCAL_ESPECIFICO: "Local específico",
  CORRIDA_APP: "Corrida de app",
};

export const tripStatusLabels: Record<TripStatus, string> = {
  AGENDADA: "Agendada",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  CARTAO_CREDITO: "Cartão crédito",
  CARTAO_DEBITO: "Cartão débito",
  TRANSFERENCIA: "Transferência",
  OUTRO: "Outro",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDENTE: "Pendente",
  PAGO_PARCIAL: "Pago parcial",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  COMBUSTIVEL: "Combustível",
  ALIMENTACAO: "Alimentação",
  AGUA: "Água",
  PEDAGIO: "Pedágio",
  MANUTENCAO: "Manutenção",
  ESTACIONAMENTO: "Estacionamento",
  OUTRO: "Outro",
};

export const agendamentoStatusLabels: Record<StatusAgendamento, string> = {
  AGENDADO: "Agendado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};
