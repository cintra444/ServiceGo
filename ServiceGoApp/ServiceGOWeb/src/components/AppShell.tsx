import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Painel", hint: "Resumo diário" },
  { to: "/trips", label: "Corridas", hint: "Operação" },
  { to: "/customers", label: "Clientes", hint: "Passageiros" },
  { to: "/vehicles", label: "Veículos", hint: "Frota" },
  { to: "/finance", label: "Financeiro", hint: "Receitas e custos" },
  { to: "/schedule", label: "Agenda", hint: "Compromissos" },
  { to: "/settings", label: "Ajustes", hint: "Conta e plano" },
];

export function AppShell() {
  const { session, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-panel">
          <div className="brand-mark">SG</div>
          <div>
            <h1>ServiceGO Web</h1>
            <p>Painel separado para navegador</p>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? " nav-item-active" : ""}`}
            >
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
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
