import type { Customer, Expense, Payment, Trip, Veiculo } from "../types/api";

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type TripsStackParamList = {
  TripsList: undefined;
  TripForm: { trip?: Trip } | undefined;
};

export type CustomersStackParamList = {
  CustomersList: undefined;
  CustomerForm: { customer?: Customer } | undefined;
};

export type VehiclesStackParamList = {
  VehiclesList: undefined;
  VehicleForm: { veiculo?: Veiculo } | undefined;
};

export type FinanceStackParamList = {
  FinanceHome: undefined;
  PaymentForm: { payment?: Payment } | undefined;
  ExpenseForm: { expense?: Expense } | undefined;
};

export type ScheduleStackParamList = {
  ScheduleList: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type MainTabParamList = {
  InicioTab: undefined;
  CorridasTab: undefined;
  ClientesTab: undefined;
  VeiculosTab: undefined;
  FinanceiroTab: undefined;
  AgendaTab: undefined;
  AjustesTab: undefined;
};
