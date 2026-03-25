import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { RegisterResponse } from "../types/api";
import { dateOnly } from "../utils/format";

function UsersIcon({
  kind,
}: {
  kind: "users" | "active" | "trial" | "admin" | "refresh" | "enable" | "disable" | "search";
}) {
  const icons = {
    users: (
      <path
        d="M8.2 10.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Zm7.6 1.8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM3.8 18.6c0-2.4 2.2-4.2 4.9-4.2s4.9 1.8 4.9 4.2m1.9 0c.2-1.7 1.8-3 3.8-3 2 0 3.6 1.3 3.8 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    active: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.8 12 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    trial: (
      <>
        <path d="M12 5v7l4.2 2.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
    admin: (
      <path d="m12 4.8 2.2 4.4 4.8.7-3.5 3.4.8 4.7-4.3-2.3-4.3 2.3.8-4.7-3.5-3.4 4.8-.7L12 4.8Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    ),
    refresh: (
      <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    ),
    enable: (
      <path d="m8.8 12 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    ),
    disable: (
      <path d="m9 9 6 6m0-6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m15.2 15.2 3.6 3.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

export function UsersPage() {
  const PAGE_SIZE_OPTIONS = [6, 12, 24];
  const { session } = useAuth();
  const [users, setUsers] = useState<RegisterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);

  const load = async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setUsers(await authApi.listUsers(session.token));
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.token]);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.active).length;
    const trial = users.filter((user) => user.plan?.status === "TRIAL").length;
    const admins = users.filter((user) => user.role === "ADMINISTRADOR" || user.role === "ROLE_ADMINISTRADOR").length;
    return { total, active, trial, admins };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const isAdmin = user.role === "ADMINISTRADOR" || user.role === "ROLE_ADMINISTRADOR";
      const matchesQuery =
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.active) ||
        (statusFilter === "inactive" && !user.active);
      const matchesPlan =
        planFilter === "all" ||
        (planFilter === "pro" && user.plan?.type === "PRO") ||
        (planFilter === "free" && user.plan?.type === "FREE") ||
        (planFilter === "trial" && user.plan?.status === "TRIAL");
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && isAdmin) ||
        (roleFilter === "driver" && !isAdmin);

      return matchesQuery && matchesStatus && matchesPlan && matchesRole;
    });
  }, [planFilter, query, roleFilter, statusFilter, users]);

  const sortedUsers = useMemo(() => {
    const nextUsers = [...filteredUsers];

    nextUsers.sort((left, right) => {
      const leftIsAdmin = left.role === "ADMINISTRADOR" || left.role === "ROLE_ADMINISTRADOR";
      const rightIsAdmin = right.role === "ADMINISTRADOR" || right.role === "ROLE_ADMINISTRADOR";
      const leftCreated = new Date(left.createdAt).getTime();
      const rightCreated = new Date(right.createdAt).getTime();

      switch (sortBy) {
        case "name_asc":
          return left.name.localeCompare(right.name, "pt-BR");
        case "name_desc":
          return right.name.localeCompare(left.name, "pt-BR");
        case "email_asc":
          return left.email.localeCompare(right.email, "pt-BR");
        case "created_asc":
          return leftCreated - rightCreated;
        case "role":
          return Number(rightIsAdmin) - Number(leftIsAdmin) || left.name.localeCompare(right.name, "pt-BR");
        case "status":
          return Number(right.active) - Number(left.active) || left.name.localeCompare(right.name, "pt-BR");
        case "created_desc":
        default:
          return rightCreated - leftCreated;
      }
    });

    return nextUsers;
  }, [filteredUsers, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));

  const pagedUsers = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedUsers, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, planFilter, roleFilter, sortBy, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const toggleStatus = async (user: RegisterResponse) => {
    if (!session?.token) {
      return;
    }
    try {
      setSavingId(user.id);
      setError(null);
      await authApi.updateUserStatus(session.token, user.id, { active: !user.active });
      await load();
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao atualizar status do usuário.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Usuários"
        description="Visão administrativa global para acompanhar cadastros, perfis e status de acesso."
        action={
          <button className="secondary-button" onClick={() => void load()} type="button">
            <span className="button-icon" aria-hidden="true">
              <UsersIcon kind="refresh" />
            </span>
            Atualizar usuários
          </button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Usuários" value={String(metrics.total)} icon={<UsersIcon kind="users" />} />
        <StatCard label="Ativos" value={String(metrics.active)} tone="success" icon={<UsersIcon kind="active" />} />
        <StatCard label="Em trial" value={String(metrics.trial)} icon={<UsersIcon kind="trial" />} />
        <StatCard label="Admins" value={String(metrics.admins)} icon={<UsersIcon kind="admin" />} />
      </div>

      <Panel title="Filtros" subtitle="Refine a visão por perfil, status, plano ou encontre rapidamente por nome e e-mail">
        <div className="form-grid compact-grid">
          <label className="field field-full">
            <span>Buscar por nome ou e-mail</span>
            <div className="input-shell">
              <span className="input-icon">
                <UsersIcon kind="search" />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Digite nome ou e-mail"
                type="search"
              />
            </div>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </label>
          <label className="field">
            <span>Plano</span>
            <select value={planFilter} onChange={(event) => setPlanFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="pro">Pro</option>
              <option value="free">Free</option>
              <option value="trial">Em trial</option>
            </select>
          </label>
          <label className="field">
            <span>Perfil</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="admin">Administrador</option>
              <option value="driver">Motorista</option>
            </select>
          </label>
          <label className="field">
            <span>Ordenar por</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="created_desc">Cadastro mais recente</option>
              <option value="created_asc">Cadastro mais antigo</option>
              <option value="name_asc">Nome A-Z</option>
              <option value="name_desc">Nome Z-A</option>
              <option value="email_asc">E-mail A-Z</option>
              <option value="role">Perfil</option>
              <option value="status">Status</option>
            </select>
          </label>
          <label className="field">
            <span>Itens por página</span>
            <select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setPlanFilter("all");
              setRoleFilter("all");
            }}
            type="button"
          >
            Limpar filtros
          </button>
          <span className="helper-text users-filter-summary">
            Exibindo {pagedUsers.length} de {filteredUsers.length} usuários filtrados.
          </span>
        </div>
      </Panel>

      <Panel title="Contas cadastradas" subtitle="Somente administrador tem acesso a esta visão consolidada do sistema">
        {loading ? <DataState message="Carregando usuários..." /> : null}
        {!loading && users.length === 0 ? <DataState message="Nenhum usuário cadastrado." /> : null}
        {!loading && users.length > 0 && filteredUsers.length === 0 ? (
          <DataState message="Nenhum usuário encontrado com os filtros atuais." />
        ) : null}
        {!loading && pagedUsers.length > 0 ? (
          <div className="entity-list">
            {pagedUsers.map((user) => {
              const isAdmin = user.role === "ADMINISTRADOR" || user.role === "ROLE_ADMINISTRADOR";
              return (
                <article className="entity-card entity-card-inline" key={user.id}>
                  <div className="entity-card-head">
                    <div>
                      <strong className="entity-card-title">
                        <span className="entity-card-icon" aria-hidden="true">
                          <UsersIcon kind={isAdmin ? "admin" : "users"} />
                        </span>
                        <span>{user.name}</span>
                      </strong>
                      <span>{user.email}</span>
                    </div>
                    <span className={`status-pill ${user.active ? "status-concluida" : "status-cancelada"}`}>
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="detail-grid">
                    <div>
                      <span className="detail-label">
                        <UsersIcon kind="admin" /> Perfil
                      </span>
                      <strong>{isAdmin ? "Administrador" : "Motorista"}</strong>
                    </div>
                    <div>
                      <span className="detail-label">
                        <UsersIcon kind="trial" /> Plano
                      </span>
                      <strong>{user.plan?.type === "PRO" ? "Pro" : "Free"} · {user.plan?.status ?? "-"}</strong>
                    </div>
                    <div>
                      <span className="detail-label">
                        <UsersIcon kind="active" /> Cadastro
                      </span>
                      <strong>{dateOnly(user.createdAt)}</strong>
                    </div>
                    <div>
                      <span className="detail-label">
                        <UsersIcon kind="trial" /> Trial até
                      </span>
                      <strong>{dateOnly(user.plan?.trialEndsAt)}</strong>
                    </div>
                  </div>

                  <div className="button-row">
                    <button
                      className={user.active ? "danger-button" : "secondary-button"}
                      disabled={savingId === user.id || isAdmin}
                      onClick={() => void toggleStatus(user)}
                      type="button"
                    >
                      <span className="button-icon" aria-hidden="true">
                        <UsersIcon kind={user.active ? "disable" : "enable"} />
                      </span>
                      {savingId === user.id ? "Atualizando..." : user.active ? "Desativar acesso" : "Ativar acesso"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
        {!loading && filteredUsers.length > 0 ? (
          <div className="pagination-bar">
            <span className="helper-text">
              Página {Math.min(page, totalPages)} de {totalPages}
            </span>
            <div className="button-row">
              <button className="secondary-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">
                Anterior
              </button>
              <button className="secondary-button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} type="button">
                Próxima
              </button>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
