import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { depreciacaoAlocacaoLabels, depreciacaoModoLabels } from "../constants/labels";
import { authApi, configuracaoApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import { getFuelSettings, setFuelSettings } from "../services/storage";
import type { ConfiguracaoUsuario, DepreciacaoAlocacao, DepreciacaoModo } from "../types/api";
import { dateOnly, parseNumber } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
};

export function SettingsPage() {
  const { session, updatePlan } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [sincronizarCalendario, setSincronizarCalendario] = useState("true");
  const [lembreteAtivo, setLembreteAtivo] = useState("true");
  const [minutos, setMinutos] = useState("30");
  const [fusoHorario, setFusoHorario] = useState("America/Sao_Paulo");
  const [depreciacaoModo, setDepreciacaoModo] = useState<DepreciacaoModo>("AUTOMATICA");
  const [depreciacaoAlocacao, setDepreciacaoAlocacao] = useState<DepreciacaoAlocacao>("POR_KM");
  const [valorAtualVeiculo, setValorAtualVeiculo] = useState("");
  const [valorEstimadoVeiculo, setValorEstimadoVeiculo] = useState("");
  const [kmBaseDepreciacao, setKmBaseDepreciacao] = useState("");
  const [mesesBaseDepreciacao, setMesesBaseDepreciacao] = useState("");
  const [anosBaseDepreciacao, setAnosBaseDepreciacao] = useState("");
  const [valorManualPorKm, setValorManualPorKm] = useState("");
  const [valorManualMensal, setValorManualMensal] = useState("");
  const [valorManualAnual, setValorManualAnual] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelEfficiency, setFuelEfficiency] = useState("");

  const isPremium = hasPremiumAccess(session?.plan);
  const isAutomatic = depreciacaoModo === "AUTOMATICA";
  const isPorKm = depreciacaoAlocacao === "POR_KM";
  const isMensal = depreciacaoAlocacao === "MENSAL";
  const isAnual = depreciacaoAlocacao === "ANUAL";

  const statusLabel = useMemo(() => {
    if (session?.plan?.status === "TRIAL") {
      return "Teste Pro";
    }
    if (session?.plan?.status === "ACTIVE") {
      return "Pro ativo";
    }
    if (session?.plan?.status === "EXPIRED") {
      return "Pro expirado";
    }
    if (session?.plan?.status === "CANCELED") {
      return "Assinatura cancelada";
    }
    return "Plano indisponível";
  }, [session?.plan?.status]);

  const applyConfig = (nextConfig: ConfiguracaoUsuario) => {
    setSincronizarCalendario(String(nextConfig.sincronizarCalendario));
    setLembreteAtivo(String(nextConfig.lembreteAtivo));
    setMinutos(String(nextConfig.minutosAntecedenciaLembrete));
    setFusoHorario(nextConfig.fusoHorario);
    setDepreciacaoModo(nextConfig.depreciacaoModo);
    setDepreciacaoAlocacao(nextConfig.depreciacaoAlocacao);
    setValorAtualVeiculo(nextConfig.valorAtualVeiculo == null ? "" : String(nextConfig.valorAtualVeiculo));
    setValorEstimadoVeiculo(nextConfig.valorEstimadoVeiculo == null ? "" : String(nextConfig.valorEstimadoVeiculo));
    setKmBaseDepreciacao(nextConfig.kmBaseDepreciacao == null ? "" : String(nextConfig.kmBaseDepreciacao));
    setMesesBaseDepreciacao(nextConfig.mesesBaseDepreciacao == null ? "" : String(nextConfig.mesesBaseDepreciacao));
    setAnosBaseDepreciacao(nextConfig.anosBaseDepreciacao == null ? "" : String(nextConfig.anosBaseDepreciacao));
    setValorManualPorKm(nextConfig.valorManualPorKm == null ? "" : String(nextConfig.valorManualPorKm));
    setValorManualMensal(nextConfig.valorManualMensal == null ? "" : String(nextConfig.valorManualMensal));
    setValorManualAnual(nextConfig.valorManualAnual == null ? "" : String(nextConfig.valorManualAnual));
  };

  useEffect(() => {
    const load = async () => {
      if (!session?.token || !session.userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        applyConfig(await configuracaoApi.get(session.token, session.userId));
        const fuel = getFuelSettings();
        setFuelPrice(fuel.fuelPrice == null ? "" : String(fuel.fuelPrice));
        setFuelEfficiency(fuel.fuelEfficiencyKmPerLiter == null ? "" : String(fuel.fuelEfficiencyKmPerLiter));
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

  const onChangePassword = async () => {
    if (!session?.token || !passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Preencha a senha atual e a nova senha.");
      return;
    }
    try {
      setSavingPassword(true);
      setError(null);
      await authApi.changePassword(session.token, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm(emptyPassword);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível alterar a senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  const onSaveConfig = async () => {
    if (!session?.token || !session.userId) {
      return;
    }
    const minutosValue = Number(minutos);
    if (!Number.isInteger(minutosValue) || minutosValue < 1) {
      setError("Informe minutos válidos.");
      return;
    }

    const payload = {
      sincronizarCalendario: sincronizarCalendario === "true",
      lembreteAtivo: lembreteAtivo === "true",
      minutosAntecedenciaLembrete: minutosValue,
      fusoHorario: fusoHorario.trim(),
      depreciacaoModo,
      depreciacaoAlocacao,
      ...(isAutomatic
        ? {
            valorAtualVeiculo: parseNumber(valorAtualVeiculo),
            valorEstimadoVeiculo: parseNumber(valorEstimadoVeiculo),
            ...(isPorKm ? { kmBaseDepreciacao: parseNumber(kmBaseDepreciacao) } : {}),
            ...(isMensal ? { mesesBaseDepreciacao: Number(mesesBaseDepreciacao) } : {}),
            ...(isAnual ? { anosBaseDepreciacao: parseNumber(anosBaseDepreciacao) } : {}),
          }
        : {}),
      ...(!isAutomatic
        ? {
            ...(isPorKm ? { valorManualPorKm: parseNumber(valorManualPorKm) } : {}),
            ...(isMensal ? { valorManualMensal: parseNumber(valorManualMensal) } : {}),
            ...(isAnual ? { valorManualAnual: parseNumber(valorManualAnual) } : {}),
          }
        : {}),
    };

    try {
      setSavingConfig(true);
      setError(null);
      const updated = await configuracaoApi.update(session.token, session.userId, payload);
      applyConfig(updated);
      setFuelSettings({
        fuelPrice: parseNumber(fuelPrice),
        fuelEfficiencyKmPerLiter: parseNumber(fuelEfficiency),
      });
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Não foi possível salvar configurações.");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Ajustes"
        description="Conta, plano, preferências e cálculo de depreciação como no app."
        action={
          <button className="secondary-button" disabled={refreshingPlan} onClick={() => void onRefreshPlan()} type="button">
            {refreshingPlan ? "Atualizando plano..." : "Atualizar plano"}
          </button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <DataState message="Carregando configurações..." /> : null}

      {!loading ? (
        <>
          <div className="two-column-grid">
            <Panel title="Conta" subtitle="Sessão autenticada no navegador">
              <div className="detail-list">
                <div><span>E-mail</span><strong>{session?.email ?? "-"}</strong></div>
                <div><span>Perfil</span><strong>{session?.role ?? "-"}</strong></div>
                <div><span>Usuário</span><strong>{session?.userId ?? "-"}</strong></div>
              </div>
              <div className="form-grid compact-grid">
                <label className="field"><span>Senha atual</span><input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
                <label className="field"><span>Nova senha</span><input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
              </div>
              <div className="button-row">
                <button className="primary-button" disabled={savingPassword} onClick={() => void onChangePassword()} type="button">
                  {savingPassword ? "Alterando..." : "Alterar senha"}
                </button>
              </div>
            </Panel>

            <Panel title="Plano" subtitle={isPremium ? "Recursos premium liberados" : "Assinatura necessária para recursos avançados"}>
              <div className="detail-list">
                <div><span>Tipo</span><strong>{session?.plan?.type === "PRO" ? "ServiceGO Pro" : "ServiceGO Free"}</strong></div>
                <div><span>Status</span><strong>{statusLabel}</strong></div>
                <div><span>Trial até</span><strong>{dateOnly(session?.plan?.trialEndsAt)}</strong></div>
              </div>
            </Panel>
          </div>

          <Panel title="Configuração do usuário" subtitle="Agenda, depreciação e combustível usados no app e na web">
            <div className="form-grid">
              <label className="field">
                <span>Sincronizar calendário</span>
                <select value={sincronizarCalendario} onChange={(event) => setSincronizarCalendario(event.target.value)}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </label>
              <label className="field">
                <span>Lembrete ativo</span>
                <select value={lembreteAtivo} onChange={(event) => setLembreteAtivo(event.target.value)}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </label>
              <label className="field"><span>Minutos de antecedência</span><input value={minutos} onChange={(event) => setMinutos(event.target.value)} /></label>
              <label className="field"><span>Fuso horário</span><input value={fusoHorario} onChange={(event) => setFusoHorario(event.target.value)} /></label>
              <label className="field">
                <span>Modo de depreciação</span>
                <select value={depreciacaoModo} onChange={(event) => setDepreciacaoModo(event.target.value as DepreciacaoModo)}>
                  {Object.entries(depreciacaoModoLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Alocação</span>
                <select value={depreciacaoAlocacao} onChange={(event) => setDepreciacaoAlocacao(event.target.value as DepreciacaoAlocacao)}>
                  {Object.entries(depreciacaoAlocacaoLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              {isAutomatic ? (
                <>
                  <label className="field"><span>Valor atual do veículo</span><input value={valorAtualVeiculo} onChange={(event) => setValorAtualVeiculo(event.target.value)} /></label>
                  <label className="field"><span>Valor estimado do veículo</span><input value={valorEstimadoVeiculo} onChange={(event) => setValorEstimadoVeiculo(event.target.value)} /></label>
                  {isPorKm ? <label className="field"><span>KM base de depreciação</span><input value={kmBaseDepreciacao} onChange={(event) => setKmBaseDepreciacao(event.target.value)} /></label> : null}
                  {isMensal ? <label className="field"><span>Meses base</span><input value={mesesBaseDepreciacao} onChange={(event) => setMesesBaseDepreciacao(event.target.value)} /></label> : null}
                  {isAnual ? <label className="field"><span>Anos base</span><input value={anosBaseDepreciacao} onChange={(event) => setAnosBaseDepreciacao(event.target.value)} /></label> : null}
                </>
              ) : (
                <>
                  {isPorKm ? <label className="field"><span>Valor manual por km</span><input value={valorManualPorKm} onChange={(event) => setValorManualPorKm(event.target.value)} /></label> : null}
                  {isMensal ? <label className="field"><span>Valor manual mensal</span><input value={valorManualMensal} onChange={(event) => setValorManualMensal(event.target.value)} /></label> : null}
                  {isAnual ? <label className="field"><span>Valor manual anual</span><input value={valorManualAnual} onChange={(event) => setValorManualAnual(event.target.value)} /></label> : null}
                </>
              )}
              <label className="field"><span>Preço do combustível</span><input value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} /></label>
              <label className="field"><span>Consumo médio (km/l)</span><input value={fuelEfficiency} onChange={(event) => setFuelEfficiency(event.target.value)} /></label>
            </div>
            <div className="button-row">
              <button className="primary-button" disabled={savingConfig} onClick={() => void onSaveConfig()} type="button">
                {savingConfig ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
