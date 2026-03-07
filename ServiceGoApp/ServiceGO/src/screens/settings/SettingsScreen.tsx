import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { useAuth } from "../../context/AuthContext";
import { authApi, configuracaoApi } from "../../services/api";
import { colors } from "../../constants/theme";
import { depreciacaoAlocacaoLabels, depreciacaoModoLabels } from "../../constants/labels";
import { parseNumber } from "../../utils/format";
import type { ConfiguracaoUsuarioRequest, DepreciacaoAlocacao, DepreciacaoModo } from "../../types/api";

export function SettingsScreen() {
  const { session, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [usuarioId, setUsuarioId] = useState("1");
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
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const isAutomatic = depreciacaoModo === "AUTOMATICA";
  const isPorKm = depreciacaoAlocacao === "POR_KM";
  const isMensal = depreciacaoAlocacao === "MENSAL";
  const isAnual = depreciacaoAlocacao === "ANUAL";

  const setConfigValues = (config: {
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
  }) => {
    setSincronizarCalendario(String(config.sincronizarCalendario));
    setLembreteAtivo(String(config.lembreteAtivo));
    setMinutos(String(config.minutosAntecedenciaLembrete));
    setFusoHorario(config.fusoHorario);
    setDepreciacaoModo(config.depreciacaoModo);
    setDepreciacaoAlocacao(config.depreciacaoAlocacao);
    setValorAtualVeiculo(config.valorAtualVeiculo == null ? "" : String(config.valorAtualVeiculo));
    setValorEstimadoVeiculo(config.valorEstimadoVeiculo == null ? "" : String(config.valorEstimadoVeiculo));
    setKmBaseDepreciacao(config.kmBaseDepreciacao == null ? "" : String(config.kmBaseDepreciacao));
    setMesesBaseDepreciacao(config.mesesBaseDepreciacao == null ? "" : String(config.mesesBaseDepreciacao));
    setAnosBaseDepreciacao(config.anosBaseDepreciacao == null ? "" : String(config.anosBaseDepreciacao));
    setValorManualPorKm(config.valorManualPorKm == null ? "" : String(config.valorManualPorKm));
    setValorManualMensal(config.valorManualMensal == null ? "" : String(config.valorManualMensal));
    setValorManualAnual(config.valorManualAnual == null ? "" : String(config.valorManualAnual));
  };

  const usuarioIdValue = useMemo(() => Number(usuarioId), [usuarioId]);

  const onLoadConfig = async () => {
    if (!session?.token) {
      return;
    }
    if (!usuarioIdValue) {
      Alert.alert("Configuração", "Informe um usuário válido para carregar.");
      return;
    }
    try {
      setLoadingConfig(true);
      const config = await configuracaoApi.get(session.token, usuarioIdValue);
      setConfigValues(config);
      Alert.alert("Configuração", "Configuração carregada.");
    } catch {
      Alert.alert("Configuração", "Não foi possível carregar configuração.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const onChangePassword = async () => {
    if (!session?.token || !currentPassword || !newPassword) {
      Alert.alert("Senha", "Preencha senha atual e nova senha.");
      return;
    }
    try {
      setSavingPassword(true);
      await authApi.changePassword(session.token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Senha", "Senha atualizada com sucesso.");
    } catch {
      Alert.alert("Senha", "Não foi possível alterar a senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  const onSaveConfig = async () => {
    if (!session?.token) {
      return;
    }
    const minutosValue = Number(minutos);
    if (!usuarioIdValue || !Number.isInteger(minutosValue) || minutosValue < 1) {
      Alert.alert("Configuração", "Informe usuário e minutos válidos.");
      return;
    }
    const valorAtual = parseNumber(valorAtualVeiculo);
    const valorEstimado = parseNumber(valorEstimadoVeiculo);
    const kmBase = parseNumber(kmBaseDepreciacao);
    const mesesBase = Number(mesesBaseDepreciacao);
    const anosBase = parseNumber(anosBaseDepreciacao);
    const manualPorKm = parseNumber(valorManualPorKm);
    const manualMensal = parseNumber(valorManualMensal);
    const manualAnual = parseNumber(valorManualAnual);

    if (isAutomatic) {
      if (valorAtual === undefined || valorEstimado === undefined) {
        Alert.alert("Configuração", "No modo automática, informe valor atual e valor estimado.");
        return;
      }
      if (valorEstimado > valorAtual) {
        Alert.alert("Configuração", "Valor estimado não pode ser maior que o valor atual.");
        return;
      }
      if (isPorKm && (kmBase === undefined || kmBase <= 0)) {
        Alert.alert("Configuração", "Informe km base de depreciação maior que zero.");
        return;
      }
      if (isMensal && (!Number.isInteger(mesesBase) || mesesBase <= 0)) {
        Alert.alert("Configuração", "Informe meses base de depreciação válido.");
        return;
      }
      if (isAnual && (anosBase === undefined || anosBase <= 0)) {
        Alert.alert("Configuração", "Informe anos base de depreciação maior que zero.");
        return;
      }
    } else {
      if (isPorKm && (manualPorKm === undefined || manualPorKm <= 0)) {
        Alert.alert("Configuração", "No manual POR_KM, informe apenas valor manual por km.");
        return;
      }
      if (isMensal && (manualMensal === undefined || manualMensal <= 0)) {
        Alert.alert("Configuração", "No manual MENSAL, informe apenas valor manual mensal.");
        return;
      }
      if (isAnual && (manualAnual === undefined || manualAnual <= 0)) {
        Alert.alert("Configuração", "No manual ANUAL, informe apenas valor manual anual.");
        return;
      }
    }

    const payload: ConfiguracaoUsuarioRequest = {
      sincronizarCalendario: sincronizarCalendario === "true",
      lembreteAtivo: lembreteAtivo === "true",
      minutosAntecedenciaLembrete: minutosValue,
      fusoHorario: fusoHorario.trim(),
      depreciacaoModo,
      depreciacaoAlocacao,
      ...(isAutomatic
        ? {
            valorAtualVeiculo: valorAtual,
            valorEstimadoVeiculo: valorEstimado,
            ...(isPorKm ? { kmBaseDepreciacao: kmBase } : {}),
            ...(isMensal ? { mesesBaseDepreciacao: mesesBase } : {}),
            ...(isAnual ? { anosBaseDepreciacao: anosBase } : {}),
          }
        : {}),
      ...(!isAutomatic
        ? {
            ...(isPorKm ? { valorManualPorKm: manualPorKm } : {}),
            ...(isMensal ? { valorManualMensal: manualMensal } : {}),
            ...(isAnual ? { valorManualAnual: manualAnual } : {}),
          }
        : {}),
    };

    try {
      setSavingConfig(true);
      const updated = await configuracaoApi.update(session.token, usuarioIdValue, payload);
      setConfigValues(updated);
      Alert.alert("Configuração", "Configuração salva.");
    } catch {
      Alert.alert("Configuração", "Não foi possível salvar configuração.");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <Screen>
      <SGCard title="Conta" subtitle={session?.email ?? "Usuário"}>
        <SGInput label="Senha atual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <SGInput label="Nova senha" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <SGButton label="Alterar senha" onPress={onChangePassword} loading={savingPassword} />
        <SGButton label="Sair da conta" onPress={logout} variant="danger" />
      </SGCard>

      <SGCard title="Configurações do usuário" subtitle="Agenda e depreciação">
        <SGInput label="Usuário ID" value={usuarioId} onChangeText={setUsuarioId} keyboardType="number-pad" />
        <SGButton label="Carregar configurações" onPress={onLoadConfig} loading={loadingConfig} variant="secondary" />
        <ChipSelect
          label="Sincronizar calendário"
          value={sincronizarCalendario}
          onChange={setSincronizarCalendario}
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
        />
        <ChipSelect
          label="Lembrete ativo"
          value={lembreteAtivo}
          onChange={setLembreteAtivo}
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
        />
        <SGInput label="Minutos de antecedência" value={minutos} onChangeText={setMinutos} keyboardType="number-pad" />
        <SGInput label="Fuso horário" value={fusoHorario} onChangeText={setFusoHorario} />

        <ChipSelect
          label="Depreciação: modo"
          value={depreciacaoModo}
          onChange={(next) => setDepreciacaoModo(next as DepreciacaoModo)}
          options={[
            { value: "AUTOMATICA", label: depreciacaoModoLabels.AUTOMATICA },
            { value: "MANUAL", label: depreciacaoModoLabels.MANUAL },
          ]}
        />
        <ChipSelect
          label="Depreciação: alocação"
          value={depreciacaoAlocacao}
          onChange={(next) => setDepreciacaoAlocacao(next as DepreciacaoAlocacao)}
          options={[
            { value: "POR_KM", label: depreciacaoAlocacaoLabels.POR_KM },
            { value: "MENSAL", label: depreciacaoAlocacaoLabels.MENSAL },
            { value: "ANUAL", label: depreciacaoAlocacaoLabels.ANUAL },
          ]}
        />

        {isAutomatic ? (
          <>
            <Text style={styles.hint}>Modo automático: informe valores do veículo e apenas 1 base pela alocação.</Text>
            <SGInput
              label="Valor atual do veículo"
              value={valorAtualVeiculo}
              onChangeText={setValorAtualVeiculo}
              keyboardType="decimal-pad"
            />
            <SGInput
              label="Valor estimado do veículo"
              value={valorEstimadoVeiculo}
              onChangeText={setValorEstimadoVeiculo}
              keyboardType="decimal-pad"
            />
            {isPorKm ? (
              <SGInput
                label="Km base de depreciação"
                value={kmBaseDepreciacao}
                onChangeText={setKmBaseDepreciacao}
                keyboardType="decimal-pad"
              />
            ) : null}
            {isMensal ? (
              <SGInput
                label="Meses base de depreciação"
                value={mesesBaseDepreciacao}
                onChangeText={setMesesBaseDepreciacao}
                keyboardType="number-pad"
              />
            ) : null}
            {isAnual ? (
              <SGInput
                label="Anos base de depreciação"
                value={anosBaseDepreciacao}
                onChangeText={setAnosBaseDepreciacao}
                keyboardType="decimal-pad"
              />
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.hint}>Modo manual: informe somente 1 valor manual conforme alocação.</Text>
            {isPorKm ? (
              <SGInput
                label="Valor manual por km"
                value={valorManualPorKm}
                onChangeText={setValorManualPorKm}
                keyboardType="decimal-pad"
              />
            ) : null}
            {isMensal ? (
              <SGInput
                label="Valor manual mensal"
                value={valorManualMensal}
                onChangeText={setValorManualMensal}
                keyboardType="decimal-pad"
              />
            ) : null}
            {isAnual ? (
              <SGInput
                label="Valor manual anual"
                value={valorManualAnual}
                onChangeText={setValorManualAnual}
                keyboardType="decimal-pad"
              />
            ) : null}
          </>
        )}

        <SGButton label="Salvar configurações" onPress={onSaveConfig} loading={savingConfig} />
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.subtext,
    fontSize: 12,
  },
});
