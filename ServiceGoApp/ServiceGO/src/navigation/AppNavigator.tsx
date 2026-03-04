import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors } from "../constants/theme";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { TripsScreen } from "../screens/trips/TripsScreen";
import { TripFormScreen } from "../screens/trips/TripFormScreen";
import { CustomersScreen } from "../screens/customers/CustomersScreen";
import { CustomerFormScreen } from "../screens/customers/CustomerFormScreen";
import { VehiclesScreen } from "../screens/vehicles/VehiclesScreen";
import { VehicleFormScreen } from "../screens/vehicles/VehicleFormScreen";
import { FinanceScreen } from "../screens/finance/FinanceScreen";
import { PaymentFormScreen } from "../screens/finance/PaymentFormScreen";
import { ExpenseFormScreen } from "../screens/finance/ExpenseFormScreen";
import { ScheduleScreen } from "../screens/schedule/ScheduleScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import type {
  AuthStackParamList,
  CustomersStackParamList,
  FinanceStackParamList,
  HomeStackParamList,
  MainTabParamList,
  ScheduleStackParamList,
  SettingsStackParamList,
  TripsStackParamList,
  VehiclesStackParamList,
} from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const TripsStack = createNativeStackNavigator<TripsStackParamList>();
const CustomersStack = createNativeStackNavigator<CustomersStackParamList>();
const VehiclesStack = createNativeStackNavigator<VehiclesStackParamList>();
const FinanceStack = createNativeStackNavigator<FinanceStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function HomeStackNav() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={DashboardScreen} options={{ title: "Painel" }} />
    </HomeStack.Navigator>
  );
}

function TripsStackNav() {
  return (
    <TripsStack.Navigator>
      <TripsStack.Screen name="TripsList" component={TripsScreen} options={{ title: "Corridas" }} />
      <TripsStack.Screen name="TripForm" component={TripFormScreen} options={{ title: "Corrida" }} />
    </TripsStack.Navigator>
  );
}

function CustomersStackNav() {
  return (
    <CustomersStack.Navigator>
      <CustomersStack.Screen
        name="CustomersList"
        component={CustomersScreen}
        options={{ title: "Clientes" }}
      />
      <CustomersStack.Screen
        name="CustomerForm"
        component={CustomerFormScreen}
        options={{ title: "Cliente" }}
      />
    </CustomersStack.Navigator>
  );
}

function VehiclesStackNav() {
  return (
    <VehiclesStack.Navigator>
      <VehiclesStack.Screen name="VehiclesList" component={VehiclesScreen} options={{ title: "Veículos" }} />
      <VehiclesStack.Screen
        name="VehicleForm"
        component={VehicleFormScreen}
        options={{ title: "Veículo" }}
      />
    </VehiclesStack.Navigator>
  );
}

function FinanceStackNav() {
  return (
    <FinanceStack.Navigator>
      <FinanceStack.Screen name="FinanceHome" component={FinanceScreen} options={{ title: "Financeiro" }} />
      <FinanceStack.Screen
        name="PaymentForm"
        component={PaymentFormScreen}
        options={{ title: "Pagamento" }}
      />
      <FinanceStack.Screen
        name="ExpenseForm"
        component={ExpenseFormScreen}
        options={{ title: "Despesa" }}
      />
    </FinanceStack.Navigator>
  );
}

function ScheduleStackNav() {
  return (
    <ScheduleStack.Navigator>
      <ScheduleStack.Screen name="ScheduleList" component={ScheduleScreen} options={{ title: "Agenda" }} />
    </ScheduleStack.Navigator>
  );
}

function SettingsStackNav() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes" }} />
    </SettingsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
            InicioTab: "view-dashboard",
            CorridasTab: "car-multiple",
            ClientesTab: "account-group",
            VeiculosTab: "car",
            FinanceiroTab: "cash-multiple",
            AgendaTab: "calendar-clock",
            AjustesTab: "cog",
          };
          const icon = icons[route.name as keyof MainTabParamList] ?? "circle";
          return <MaterialCommunityIcons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="InicioTab" component={HomeStackNav} options={{ title: "Início" }} />
      <Tabs.Screen name="CorridasTab" component={TripsStackNav} options={{ title: "Corridas" }} />
      <Tabs.Screen name="ClientesTab" component={CustomersStackNav} options={{ title: "Clientes" }} />
      <Tabs.Screen name="VeiculosTab" component={VehiclesStackNav} options={{ title: "Veículos" }} />
      <Tabs.Screen name="FinanceiroTab" component={FinanceStackNav} options={{ title: "Financeiro" }} />
      <Tabs.Screen name="AgendaTab" component={ScheduleStackNav} options={{ title: "Agenda" }} />
      <Tabs.Screen name="AjustesTab" component={SettingsStackNav} options={{ title: "Ajustes" }} />
    </Tabs.Navigator>
  );
}

function AuthStackNav() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator() {
  const { isReady, session } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <NavigationContainer>{session ? <MainTabs /> : <AuthStackNav />}</NavigationContainer>;
}
