import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { configuracaoApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { ConfiguracaoUsuario } from "../types/api";
import { dateOnly } from "../utils/format";

export function SettingsPage() {
  const { session, updatePlan } = useAuth();
  const [config, setConfig] = useState<ConfiguracaoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token || session.userId == null) {
      setLoading(false);
      return;
    }

    const userId = session.userId;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setConfig(await configuracaoApi.get(session.token, userId));
      } catch (nextError) {
        setError(nextError instanceof ApiError ? nextError.message : "Falha ao carregar ajustes.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session?.token, session?.userId]);

  const onRefreshPlan = async () => {
    try {
      setRefreshingPlan(true);
      await updatePlan();
    } finally {
      setRefreshingPlan(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Ajustes"
        description="Resumo da conta, plano e preferências carregadas do backend."
        action={
          <button className="secondary-button" disabled={refreshingPlan} onClick={onRefreshPlan} type="button">
            {refreshingPlan ? "Atualizando plano..." : "Atualizar plano"}
          </button>
        }
      />

      <div className="two-column-grid">
        <Panel title="Conta" subtitle="Sessão autenticada no navegador">
          <div className="detail-list">
            <div>
              <span>E-mail</span>
              <strong>{session?.email ?? "-"}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{session?.role ?? "-"}</strong>
            </div>
            <div>
              <span>Usuário</span>
              <strong>{session?.userId ?? "-"}</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Plano" subtitle="Situação da assinatura carregada da sessão">
          <div className="detail-list">
            <div>
              <span>Tipo</span>
              <strong>{session?.plan?.type ?? "FREE"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{session?.plan?.status ?? "-"}</strong>
            </div>
            <div>
              <span>Trial até</span>
              <strong>{dateOnly(session?.plan?.trialEndsAt)}</strong>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Configuração do usuário" subtitle="Preferências disponíveis para a conta logada">
        {loading ? <DataState message="Carregando configurações..." /> : null}
        {error ? <div className="error-banner">{error}</div> : null}
        {!loading && !error && !session?.userId ? (
          <DataState message="A sessão web não recebeu userId para consultar as configurações." />
        ) : null}
        {!loading && !error && session?.userId && !config ? (
          <DataState message="Nenhuma configuração retornada pelo backend." />
        ) : null}
        {!loading && !error && config ? (
          <div className="detail-grid">
            <div>
              <span>Sincronizar calendário</span>
              <strong>{config.sincronizarCalendario ? "Sim" : "Não"}</strong>
            </div>
            <div>
              <span>Lembrete ativo</span>
              <strong>{config.lembreteAtivo ? "Sim" : "Não"}</strong>
            </div>
            <div>
              <span>Antecedência</span>
              <strong>{config.minutosAntecedenciaLembrete} min</strong>
            </div>
            <div>
              <span>Fuso</span>
              <strong>{config.fusoHorario}</strong>
            </div>
            <div>
              <span>Depreciação</span>
              <strong>
                {config.depreciacaoModo} / {config.depreciacaoAlocacao}
              </strong>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
