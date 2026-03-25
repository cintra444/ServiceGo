import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FinancePage } from "./pages/FinancePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SchedulePage } from "./pages/SchedulePage";
import { SettingsPage } from "./pages/SettingsPage";
import { TripsPage } from "./pages/TripsPage";
import { UsersPage } from "./pages/UsersPage";
import { VehiclesPage } from "./pages/VehiclesPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
