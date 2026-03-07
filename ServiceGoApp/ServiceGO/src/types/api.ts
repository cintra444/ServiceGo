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
}

export interface Customer {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface CustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
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

export interface VeiculoRequest {
  modelo: string;
  placa: string;
  ano: number;
  cor?: string;
  ativo: boolean;
  kmAtual: number;
  donoUsuarioId: number;
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

export interface TripRequest {
  customerId?: number | null;
  veiculoId: number;
  tripType: TripType;
  status: TripStatus;
  origin: string;
  destination: string;
  appPlatform?: string;
  startAt: string;
  endAt?: string;
  distanceKm?: number;
  estimatedAmount?: number;
  actualAmount?: number;
  notes?: string;
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

export interface PaymentRequest {
  tripId?: number | null;
  customerId?: number | null;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  pagamentoParcial: boolean;
  numeroParcela?: number;
  paidAt?: string;
  dueAt?: string;
  referenceCode?: string;
  notes?: string;
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

export interface ExpenseRequest {
  tripId?: number | null;
  veiculoId: number;
  category: ExpenseCategory;
  amount: number;
  description?: string;
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

export interface AgendamentoRequest {
  tripId: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  localEvento?: string;
  inicioEm: string;
  fimEm?: string;
  fusoHorario: string;
  lembreteMinutos?: number;
  idEventoExterno?: string;
  status: StatusAgendamento;
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

export interface ConfiguracaoUsuarioRequest {
  sincronizarCalendario: boolean;
  lembreteAtivo: boolean;
  minutosAntecedenciaLembrete: number;
  fusoHorario: string;
  depreciacaoModo: DepreciacaoModo;
  depreciacaoAlocacao: DepreciacaoAlocacao;
  valorAtualVeiculo?: number;
  valorEstimadoVeiculo?: number;
  kmBaseDepreciacao?: number;
  mesesBaseDepreciacao?: number;
  anosBaseDepreciacao?: number;
  valorManualPorKm?: number;
  valorManualMensal?: number;
  valorManualAnual?: number;
}

export interface RelatorioFinanceiro {
  usuarioId: number;
  veiculoId?: number | null;
  periodoInicio: string;
  periodoFim: string;
  totalCorridas: number;
  kmTotal: number;
  receitaTotal: number;
  custosVariaveisTotal: number;
  depreciacaoTotalPeriodo: number;
  custoOperacionalTotal: number;
  custoOperacionalPorKm: number;
  lucroTotal: number;
  lucroPorKm: number;
  lucroPorCorrida: number;
  lucroPorDia: number;
  lucroPorMes: number;
}
