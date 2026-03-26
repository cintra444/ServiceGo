import { useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { depreciacaoAlocacaoLabels } from "../constants/labels";
import { authApi, configuracaoApi } from "../services/api";
import { ApiError } from "../services/apiClient";
import type { ConfiguracaoUsuario, DepreciacaoAlocacao, DepreciacaoModo } from "../types/api";
import { currency, dateOnly, parseNumber } from "../utils/format";
import { hasPremiumAccess } from "../utils/plan";

function SettingsIcon({
  kind,
}: {
  kind:
    | "refresh"
    | "account"
    | "email"
    | "role"
    | "user"
    | "lock"
    | "plan"
    | "status"
    | "calendar"
    | "settings"
    | "save";
}) {
  const icons = {
    refresh: (
      <path
        d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    account: (
      <>
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    email: (
      <path
        d="M5.5 7.2h13c.7 0 1.3.6 1.3 1.3v7c0 .7-.6 1.3-1.3 1.3h-13c-.7 0-1.3-.6-1.3-1.3v-7c0-.7.6-1.3 1.3-1.3Zm0 1.1L12 13l6.5-4.7"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
    role: (
      <>
        <path d="M7.5 18.5h9M9 18.5v-2.3a3 3 0 1 1 6 0v2.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="12" cy="9" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
    user: (
      <>
        <path d="M12 5.2 13.8 9l4.2.6-3 2.9.7 4.1-3.7-2-3.7 2 .7-4.1-3-2.9 4.2-.6L12 5.2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    lock: (
      <>
        <rect x="6.5" y="11" width="11" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 11V8.8a3 3 0 1 1 6 0V11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    plan: (
      <>
        <path d="m12 4.8 2.2 4.4 4.8.7-3.5 3.4.8 4.7-4.3-2.3-4.3 2.3.8-4.7-3.5-3.4 4.8-.7L12 4.8Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    status: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.8 12 2.1 2.1 4.3-4.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 4.8v2.4M17 4.8v2.4M5.5 8.2h13M6.8 6.5h10.4c.9 0 1.6.7 1.6 1.6v9.9c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6V8.1c0-.9.7-1.6 1.6-1.6Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 4.8v2.1M12 17.1v2.1M19.2 12h-2.1M6.9 12H4.8M17.1 6.9l-1.5 1.5M8.4 15.6l-1.5 1.5M17.1 17.1l-1.5-1.5M8.4 8.4 6.9 6.9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
    save: (
      <>
        <path d="M6 5.5h10.6l1.9 1.9v11.1c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8V5.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M8.8 5.5v4.3h6.2V5.5M9 15.3h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
};

const depreciationModeUxLabels: Record<DepreciacaoModo, string> = {
  MANUAL: "Valor direto (recomendado)",
  AUTOMATICA: "Calculo automatico (avancado)",
};

const manualFieldLabels: Record<DepreciacaoAlocacao, string> = {
  POR_KM: "Custo de depreciacao por km",
  MENSAL: "Custo de depreciacao por mes",
  ANUAL: "Custo de depreciacao por ano",
};

const manualFieldPlaceholders: Record<DepreciacaoAlocacao, string> = {
  POR_KM: "Ex: 0,35",
  MENSAL: "Ex: 500",
  ANUAL: "Ex: 6000",
};

const automaticPeriodLabels: Record<Exclude<DepreciacaoAlocacao, "POR_KM">, string> = {
  MENSAL: "Em meses",
  ANUAL: "Em anos",
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
  const [depreciacaoModo, setDepreciacaoModo] = useState<DepreciacaoModo>("MANUAL");
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
  const valorAtual = parseNumber(valorAtualVeiculo) ?? 0;
  const valorResidual = parseNumber(valorEstimadoVeiculo) ?? 0;
  const depreciacaoTotal = Math.max(0, valorAtual - valorResidual);
  const custoBase =
    isAutomatic
      ? (parseNumber(kmBaseDepreciacao) ?? 0) > 0
        ? depreciacaoTotal / Number(parseNumber(kmBaseDepreciacao) ?? 0)
        : 0
      : 0;

  useEffect(() => {
    if (depreciacaoModo === "AUTOMATICA" && depreciacaoAlocacao === "POR_KM") {
      setDepreciacaoAlocacao("ANUAL");
    }
  }, [depreciacaoAlocacao, depreciacaoModo]);

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
    setFuelPrice(nextConfig.fuelPrice == null ? "" : String(nextConfig.fuelPrice));
    setFuelEfficiency(nextConfig.fuelEfficiencyKmLiter == null ? "" : String(nextConfig.fuelEfficiencyKmLiter));
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
    if (isAutomatic) {
      const valorAtualInput = parseNumber(valorAtualVeiculo);
      const valorResidualInput = parseNumber(valorEstimadoVeiculo);
      const kmBaseInput = parseNumber(kmBaseDepreciacao);
      const anosBaseInput = parseNumber(anosBaseDepreciacao);
      const mesesBaseInput = Number(mesesBaseDepreciacao);

      if (valorAtualInput === undefined || valorResidualInput === undefined) {
        setError("No modo automático, informe valor atual e valor de venda do veículo.");
        return;
      }
      if (valorResidualInput > valorAtualInput) {
        setError("O valor de venda não pode ser maior que o valor atual do veículo.");
        return;
      }
      if (kmBaseInput === undefined || kmBaseInput <= 0) {
        setError("Informe a quilometragem rodada no período com um valor maior que zero.");
        return;
      }
      if (isMensal && (!Number.isInteger(mesesBaseInput) || mesesBaseInput <= 0)) {
        setError("Informe quantos meses compõem esse período de cálculo.");
        return;
      }
      if (isAnual && (anosBaseInput === undefined || anosBaseInput <= 0)) {
        setError("Informe quantos anos compõem esse período de cálculo.");
        return;
      }
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
            kmBaseDepreciacao: parseNumber(kmBaseDepreciacao),
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
      fuelPrice: parseNumber(fuelPrice),
      fuelEfficiencyKmLiter: parseNumber(fuelEfficiency),
    };

    try {
      setSavingConfig(true);
      setError(null);
      const updated = await configuracaoApi.update(session.token, session.userId, payload);
      applyConfig(updated);
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
        description="Conta, plano, preferências e custo operacional usado no cálculo das corridas."
        action={
          <button className="secondary-button" disabled={refreshingPlan} onClick={() => void onRefreshPlan()} type="button">
            <span className="button-icon" aria-hidden="true">
              <SettingsIcon kind="refresh" />
            </span>
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
                <div><span className="detail-label"><SettingsIcon kind="email" /> E-mail</span><strong>{session?.email ?? "-"}</strong></div>
                <div><span className="detail-label"><SettingsIcon kind="role" /> Perfil</span><strong>{session?.role ?? "-"}</strong></div>
                <div><span className="detail-label"><SettingsIcon kind="user" /> Usuário</span><strong>{session?.userId ?? "-"}</strong></div>
              </div>
              <div className="form-grid compact-grid">
                <label className="field"><span>Senha atual</span><input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
                <label className="field"><span>Nova senha</span><input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
              </div>
              <div className="button-row">
                <button className="primary-button" disabled={savingPassword} onClick={() => void onChangePassword()} type="button">
                  <span className="button-icon" aria-hidden="true">
                    <SettingsIcon kind="lock" />
                  </span>
                  {savingPassword ? "Alterando..." : "Alterar senha"}
                </button>
              </div>
            </Panel>

            <Panel title="Plano" subtitle={isPremium ? "Recursos premium liberados" : "Assinatura necessária para recursos avançados"}>
              <div className="detail-list">
                <div><span className="detail-label"><SettingsIcon kind="plan" /> Tipo</span><strong>{session?.plan?.type === "PRO" ? "ServiceGO Pro" : "ServiceGO Free"}</strong></div>
                <div><span className="detail-label"><SettingsIcon kind="status" /> Status</span><strong>{statusLabel}</strong></div>
                <div><span className="detail-label"><SettingsIcon kind="calendar" /> Trial até</span><strong>{dateOnly(session?.plan?.trialEndsAt)}</strong></div>
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
                  {(["MANUAL", "AUTOMATICA"] as DepreciacaoModo[]).map((value) => (
                    <option key={value} value={value}>
                      {depreciationModeUxLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Como deseja distribuir esse custo</span>
                <select value={depreciacaoAlocacao} onChange={(event) => setDepreciacaoAlocacao(event.target.value as DepreciacaoAlocacao)}>
                  {(isAutomatic
                    ? (Object.entries(automaticPeriodLabels) as [Exclude<DepreciacaoAlocacao, "POR_KM">, string][])
                    : (Object.entries(depreciacaoAlocacaoLabels) as [DepreciacaoAlocacao, string][])).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {isAutomatic ? (
                <>
                  <label className="field">
                    <span>Valor atual do veículo</span>
                    <input value={valorAtualVeiculo} onChange={(event) => setValorAtualVeiculo(event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Valor de venda ao fim do período</span>
                    <input value={valorEstimadoVeiculo} onChange={(event) => setValorEstimadoVeiculo(event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Km rodado no período</span>
                    <input value={kmBaseDepreciacao} onChange={(event) => setKmBaseDepreciacao(event.target.value)} />
                  </label>
                  {isMensal ? (
                    <label className="field">
                      <span>Quantidade de meses no período</span>
                      <input value={mesesBaseDepreciacao} onChange={(event) => setMesesBaseDepreciacao(event.target.value)} />
                    </label>
                  ) : null}
                  {isAnual ? (
                    <label className="field">
                      <span>Quantidade de anos no período</span>
                      <input value={anosBaseDepreciacao} onChange={(event) => setAnosBaseDepreciacao(event.target.value)} />
                    </label>
                  ) : null}
                </>
              ) : (
                <>
                  {isPorKm ? (
                    <label className="field">
                      <span>{manualFieldLabels.POR_KM}</span>
                      <input
                        value={valorManualPorKm}
                        onChange={(event) => setValorManualPorKm(event.target.value)}
                        placeholder={manualFieldPlaceholders.POR_KM}
                      />
                    </label>
                  ) : null}
                  {isMensal ? (
                    <label className="field">
                      <span>{manualFieldLabels.MENSAL}</span>
                      <input
                        value={valorManualMensal}
                        onChange={(event) => setValorManualMensal(event.target.value)}
                        placeholder={manualFieldPlaceholders.MENSAL}
                      />
                    </label>
                  ) : null}
                  {isAnual ? (
                    <label className="field">
                      <span>{manualFieldLabels.ANUAL}</span>
                      <input
                        value={valorManualAnual}
                        onChange={(event) => setValorManualAnual(event.target.value)}
                        placeholder={manualFieldPlaceholders.ANUAL}
                      />
                    </label>
                  ) : null}
                </>
              )}
              <label className="field"><span>Preço do combustível</span><input value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} /></label>
              <label className="field"><span>Consumo médio (km/l)</span><input value={fuelEfficiency} onChange={(event) => setFuelEfficiency(event.target.value)} /></label>
            </div>
            {!isAutomatic ? (
              <div className="settings-note">
                <strong>Forma mais simples</strong>
                <p>
                  Informe diretamente quanto o seu veiculo perde de valor por km, por mes ou por ano.
                </p>
                <p>
                  Referencia pratica: muitos motoristas trabalham com algo entre <strong>R$ 0,15</strong> e <strong>R$ 0,20 por km</strong>, dependendo do veiculo e do uso.
                </p>
                <p>Se preferir, use diretamente o modo <strong>Por km</strong>, que costuma ser o mais facil de entender e ajustar no dia a dia.</p>
              </div>
            ) : null}
            {isAutomatic ? (
              <div className="settings-note">
                <strong>Modo avancado</strong>
                <p>
                  Aqui a depreciação automatica sempre vira um custo por km. Primeiro calculamos quanto o veiculo desvalorizou no periodo, depois dividimos pelo km rodado nesse mesmo periodo.
                </p>
                <p>
                  Exemplo: atual {currency(valorAtual)} e venda {currency(valorResidual)} geram depreciação total de {currency(depreciacaoTotal)} no periodo informado.
                </p>
                <p>
                  {`Com a base atual, isso representa ${currency(custoBase)} por km rodado.`}
                </p>
                <p>A corrida usa esse valor por km multiplicado pela distância da viagem.</p>
              </div>
            ) : null}
            <div className="button-row">
              <button className="primary-button" disabled={savingConfig} onClick={() => void onSaveConfig()} type="button">
                <span className="button-icon" aria-hidden="true">
                  <SettingsIcon kind="save" />
                </span>
                {savingConfig ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
