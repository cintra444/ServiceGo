import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Painel", hint: "Resumo diário", icon: "dashboard" as const },
  { to: "/trips", label: "Corridas", hint: "Operação", icon: "trips" as const },
  { to: "/customers", label: "Clientes", hint: "Passageiros", icon: "customers" as const },
  { to: "/vehicles", label: "Veículos", hint: "Frota", icon: "vehicles" as const },
  { to: "/finance", label: "Financeiro", hint: "Receitas e custos", icon: "finance" as const },
  { to: "/schedule", label: "Agenda", hint: "Compromissos", icon: "schedule" as const },
  { to: "/settings", label: "Ajustes", hint: "Conta e plano", icon: "settings" as const },
];

function NavIcon({
  kind,
}: {
  kind: "dashboard" | "trips" | "customers" | "vehicles" | "finance" | "schedule" | "settings";
}) {
  const icons = {
    dashboard: (
      <path
        d="M5 5.5h5.5v5.5H5Zm8.5 0H19v3.5h-5.5ZM13.5 12.5H19V19h-5.5ZM5 14.5h5.5V19H5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    trips: (
      <path
        d="M4.5 15.5h15m-12.8 0 1.1-6.2c.12-.69.18-1.03.37-1.28.17-.23.4-.41.67-.53.3-.14.66-.14 1.38-.14h3.5c.72 0 1.08 0 1.38.14.27.12.5.3.67.53.19.25.25.59.37 1.28l1.1 6.2M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    customers: (
      <path
        d="M8.2 10.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Zm7.6 1.8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM3.8 18.6c0-2.4 2.2-4.2 4.9-4.2s4.9 1.8 4.9 4.2m1.9 0c.2-1.7 1.8-3 3.8-3 2 0 3.6 1.3 3.8 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    vehicles: (
      <path
        d="M4.5 14.8h15m-12.7 0 1-5.3c.12-.66.18-.99.37-1.23.17-.21.4-.38.66-.49.28-.12.63-.12 1.34-.12h3.6c.71 0 1.06 0 1.34.12.26.11.49.28.66.49.19.24.25.57.37 1.23l1 5.3M7.2 18a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Zm9.6 0a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    finance: (
      <path
        d="M5 18.5h14M7.5 16V9m4 7V5.5m4 10.5V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    schedule: (
      <path
        d="M7 4.8v2.4M17 4.8v2.4M4.8 9.2h14.4M7 19h10c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C20.2 17.48 20.2 16.92 20.2 15.8V8.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C18.68 5.4 18.12 5.4 17 5.4H7c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3.8 6.92 3.8 7.48 3.8 8.6v7.2c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C5.32 19 5.88 19 7 19Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    settings: (
      <path
        d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm7.2 3.4-.95-.55a1 1 0 0 1-.46-1.18l.26-1.05-1.5-1.5-1.05.26a1 1 0 0 1-1.18-.46L13.8 6.6h-1.6l-.55.95a1 1 0 0 1-1.18.46l-1.05-.26-1.5 1.5.26 1.05a1 1 0 0 1-.46 1.18l-.95.55v1.6l.95.55a1 1 0 0 1 .46 1.18l-.26 1.05 1.5 1.5 1.05-.26a1 1 0 0 1 1.18.46l.55.95h1.6l.55-.95a1 1 0 0 1 1.18-.46l1.05.26 1.5-1.5-.26-1.05a1 1 0 0 1 .46-1.18l.95-.55v-1.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

export function AppShell() {
  const { session, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-panel">
          <div className="brand-mark">SG</div>
          <div>
            <h1>ServiceGO Web</h1>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? " nav-item-active" : ""}`}
            >
              <span className="nav-item-icon">
                <NavIcon kind={item.icon} />
              </span>
              <div className="nav-item-copy">
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="session-card">
          <span className="eyebrow">Sessão ativa</span>
          <strong>{session?.email ?? "Usuário"}</strong>
          <span>{session?.plan?.type === "PRO" ? "Plano Pro" : "Plano Free"}</span>
          <button className="secondary-button" onClick={logout} type="button">
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
