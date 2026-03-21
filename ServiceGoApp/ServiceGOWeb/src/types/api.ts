export type UserRole = "ADMINISTRADOR" | "MOTORISTA";

export type TripType =
  | "TRASLADO_AEROPORTO"
  | "INTERMUNICIPAL"
  | "LOCAL_ESPECIFICO"
  | "CORRIDA_APP";

export type TripStatus = "AGENDADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";

export type PaymentMethod =
  | "PIX"
  | "DINHEIRO"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "TRANSFERENCIA"
  | "OUTRO";

export type PaymentStatus = "PENDENTE" | "PAGO_PARCIAL" | "PAGO" | "CANCELADO";

export type ExpenseCategory =
  | "COMBUSTIVEL"
  | "ALIMENTACAO"
  | "AGUA"
  | "PEDAGIO"
  | "MANUTENCAO"
  | "ESTACIONAMENTO"
  | "OUTRO";

export type StatusAgendamento = "AGENDADO" | "CONCLUIDO" | "CANCELADO";
export type DepreciacaoModo = "AUTOMATICA" | "MANUAL";
export type DepreciacaoAlocacao = "POR_KM" | "MENSAL" | "ANUAL";
export type PlanType = "FREE" | "PRO";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELED";
export type SubscriptionSource = "MANUAL" | "GOOGLE" | "APPLE";

export interface SubscriptionPlan {
  type: PlanType;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  role: `ROLE_${UserRole}` | string;
  userId?: number;
  plan?: SubscriptionPlan;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface Veiculo {
  id: number;
  modelo: string;
  placa: string;
  ano: number;
  cor?: string | null;
  ativo: boolean;
  kmAtual: number;
  donoUsuarioId: number;
  donoNome?: string | null;
}

export interface Trip {
  id: number;
  customerId?: number | null;
  customerName?: string | null;
  veiculoId: number;
  veiculoPlaca?: string | null;
  veiculoModelo?: string | null;
  tripType: TripType;
  status: TripStatus;
  origin: string;
  destination: string;
  appPlatform?: string | null;
  startAt: string;
  endAt?: string | null;
  distanceKm?: number | null;
  estimatedAmount?: number | null;
  actualAmount?: number | null;
  notes?: string | null;
  createdAt?: string;
}

export interface Payment {
  id: number;
  tripId?: number | null;
  customerId?: number | null;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  pagamentoParcial: boolean;
  numeroParcela?: number | null;
  paidAt?: string | null;
  dueAt?: string | null;
  referenceCode?: string | null;
  notes?: string | null;
}

export interface Expense {
  id: number;
  tripId?: number | null;
  veiculoId: number;
  veiculoPlaca?: string | null;
  category: ExpenseCategory;
  amount: number;
  description?: string | null;
  occurredAt: string;
}

export interface Agendamento {
  id: number;
  tripId: number;
  usuarioId: number;
  usuarioNome?: string | null;
  titulo: string;
  descricao?: string | null;
  localEvento?: string | null;
  inicioEm: string;
  fimEm?: string | null;
  fusoHorario: string;
  lembreteMinutos?: number | null;
  idEventoExterno?: string | null;
  status: StatusAgendamento;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ConfiguracaoUsuario {
  id: number;
  usuarioId: number;
  sincronizarCalendario: boolean;
  lembreteAtivo: boolean;
  minutosAntecedenciaLembrete: number;
  fusoHorario: string;
  depreciacaoModo: DepreciacaoModo;
  depreciacaoAlocacao: DepreciacaoAlocacao;
  valorAtualVeiculo?: number | null;
  valorEstimadoVeiculo?: number | null;
  kmBaseDepreciacao?: number | null;
  mesesBaseDepreciacao?: number | null;
  anosBaseDepreciacao?: number | null;
  valorManualPorKm?: number | null;
  valorManualMensal?: number | null;
  valorManualAnual?: number | null;
}
