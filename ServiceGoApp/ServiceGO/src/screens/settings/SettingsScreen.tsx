import React, { useEffect, useLayoutEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderHelpButton } from "../../components/ui/HeaderHelpButton";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { useAuth } from "../../context/AuthContext";
import { authApi, configuracaoApi } from "../../services/api";
import { fuelSettingsStorage } from "../../services/storage";
import { colors } from "../../constants/theme";
import { depreciacaoAlocacaoLabels, depreciacaoModoLabels } from "../../constants/labels";
import { dateOnly, parseNumber } from "../../utils/format";
import { hasPremiumAccess } from "../../utils/plan";
import type { ConfiguracaoUsuarioRequest, DepreciacaoAlocacao, DepreciacaoModo } from "../../types/api";
import type { SettingsStackParamList } from "../../navigation/types";

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList, "Settings">>();
  const { session, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const isAutomatic = depreciacaoModo === "AUTOMATICA";
  const isPorKm = depreciacaoAlocacao === "POR_KM";
  const isMensal = depreciacaoAlocacao === "MENSAL";
  const isAnual = depreciacaoAlocacao === "ANUAL";
  const isPremium = hasPremiumAccess(session?.plan);
  const planStatusLabel =
    session?.plan?.status === "TRIAL"
      ? "Teste Pro"
      : session?.plan?.status === "ACTIVE"
        ? "Pro ativo"
        : session?.plan?.status === "EXPIRED"
          ? "Pro expirado"
          : session?.plan?.status === "CANCELED"
            ? "Assinatura cancelada"
            : "Plano indisponível";

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

  const usuarioIdValue = session?.userId;

  const onLoadConfig = async () => {
    if (!session?.token) {
      return;
    }
    if (!usuarioIdValue) {
      Alert.alert("Configuração", "Não foi possível identificar seu usuário na sessão.");
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

  useEffect(() => {
    if (!session?.token || !usuarioIdValue) {
      return;
    }
    const loadInitialConfig = async () => {
      try {
        setLoadingConfig(true);
        const config = await configuracaoApi.get(session.token, usuarioIdValue);
        setConfigValues(config);
      } catch {
        Alert.alert("Configuração", "Não foi possível carregar configuração.");
      } finally {
        setLoadingConfig(false);
      }
    };
    loadInitialConfig();
  }, [session?.token, usuarioIdValue]);

  useEffect(() => {
    const loadFuelSettings = async () => {
      const settings = await fuelSettingsStorage.get();
      setFuelPrice(settings.fuelPrice == null ? "" : String(settings.fuelPrice));
      setFuelEfficiency(settings.fuelEfficiencyKmPerLiter == null ? "" : String(settings.fuelEfficiencyKmPerLiter));
    };
    loadFuelSettings();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderHelpButton
          title="Ajustes"
          message="Aqui voce altera senha, define lembretes, calendario e configuracoes de depreciacao usadas no relatorio financeiro."
        />
      ),
    });
  }, [navigation]);

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
      Alert.alert("Configuração", "Não foi possível identificar usuário ou minutos inválidos.");
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
    const fuelPriceValue = parseNumber(fuelPrice);
    const fuelEfficiencyValue = parseNumber(fuelEfficiency);

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
      await fuelSettingsStorage.save({
        fuelPrice: fuelPriceValue,
        fuelEfficiencyKmPerLiter: fuelEfficiencyValue,
      });
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
        <View style={styles.infoRow}>
          <Ionicons name="person-circle-outline" size={16} color={colors.subtext} />
          <Text style={styles.hint}>Usuário da sessão: {usuarioIdValue ?? "-"}</Text>
        </View>
        <SGInput label="Senha atual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <SGInput
          label="Nova senha"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Digite sua nova senha"
        />
        <SGButton
          label="Alterar senha"
          onPress={onChangePassword}
          loading={savingPassword}
          icon={<Ionicons name="key-outline" size={18} color="#fff" />}
        />
        <SGButton
          label="Sair da conta"
          onPress={logout}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
        />
      </SGCard>

      <SGCard title="Plano" subtitle={isPremium ? "Recursos premium liberados" : "Assinatura necessária para recursos avançados"}>
        <View style={styles.infoRow}>
          <Ionicons name={isPremium ? "diamond-outline" : "lock-closed-outline"} size={16} color={isPremium ? colors.primaryDark : colors.accent} />
          <Text style={styles.hint}>
            {session?.plan?.type === "PRO" ? "ServiceGO Pro" : "ServiceGO Free"} - {planStatusLabel}
          </Text>
        </View>
        {session?.plan?.trialEndsAt ? (
          <Text style={styles.hint}>Teste atual até {dateOnly(session.plan.trialEndsAt)}.</Text>
        ) : null}
        <SGButton
          label="Abrir Assinar Pro"
          onPress={() => navigation.navigate("Subscription")}
          variant="secondary"
          icon={<Ionicons name="diamond-outline" size={18} color="#fff" />}
        />
      </SGCard>

      <SGCard title="Agenda" subtitle="Lembretes e calendario">
        <SGButton
          label="Atualizar configuracoes"
          onPress={onLoadConfig}
          loading={loadingConfig}
          variant="secondary"
          icon={<Ionicons name="refresh-circle-outline" size={18} color="#fff" />}
        />
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
        <SGInput
          label="Minutos de antecedência"
          value={minutos}
          onChangeText={setMinutos}
          keyboardType="number-pad"
          placeholder="Ex: 30"
        />
        <SGInput
          label="Fuso horário"
          value={fusoHorario}
          onChangeText={setFusoHorario}
          placeholder="Ex: America/Sao_Paulo"
        />
      </SGCard>

      <SGCard title="Depreciação" subtitle="Calculo do custo do veículo">
        <ChipSelect
          label="Modo"
          value={depreciacaoModo}
          onChange={(next) => setDepreciacaoModo(next as DepreciacaoModo)}
          options={[
            { value: "AUTOMATICA", label: depreciacaoModoLabels.AUTOMATICA },
            { value: "MANUAL", label: depreciacaoModoLabels.MANUAL },
          ]}
        />
        <ChipSelect
          label="Alocação"
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
            <View style={styles.infoRow}>
              <Ionicons name="flash-outline" size={16} color={colors.subtext} />
              <Text style={styles.hint}>Informe os valores do veículo e apenas uma base de cálculo.</Text>
            </View>
            <SGInput
              label="Valor atual do veículo"
              value={valorAtualVeiculo}
              onChangeText={setValorAtualVeiculo}
              keyboardType="decimal-pad"
              placeholder="Ex: 65000"
            />
            <SGInput
              label="Valor estimado do veículo"
              value={valorEstimadoVeiculo}
              onChangeText={setValorEstimadoVeiculo}
              keyboardType="decimal-pad"
              placeholder="Ex: 30000"
            />
            {isPorKm ? (
              <SGInput
                label="Km base de depreciação"
                value={kmBaseDepreciacao}
                onChangeText={setKmBaseDepreciacao}
                keyboardType="decimal-pad"
                placeholder="Ex: 120000"
              />
            ) : null}
            {isMensal ? (
              <SGInput
                label="Meses base de depreciação"
                value={mesesBaseDepreciacao}
                onChangeText={setMesesBaseDepreciacao}
                keyboardType="number-pad"
                placeholder="Ex: 48"
              />
            ) : null}
            {isAnual ? (
              <SGInput
                label="Anos base de depreciação"
                value={anosBaseDepreciacao}
                onChangeText={setAnosBaseDepreciacao}
                keyboardType="decimal-pad"
                placeholder="Ex: 4"
              />
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="create-outline" size={16} color={colors.subtext} />
              <Text style={styles.hint}>Informe apenas um valor manual conforme a alocação escolhida.</Text>
            </View>
            {isPorKm ? (
              <SGInput
                label="Valor manual por km"
                value={valorManualPorKm}
                onChangeText={setValorManualPorKm}
                keyboardType="decimal-pad"
                placeholder="Ex: 0,45"
              />
            ) : null}
            {isMensal ? (
              <SGInput
                label="Valor manual mensal"
                value={valorManualMensal}
                onChangeText={setValorManualMensal}
                keyboardType="decimal-pad"
                placeholder="Ex: 850"
              />
            ) : null}
            {isAnual ? (
              <SGInput
                label="Valor manual anual"
                value={valorManualAnual}
                onChangeText={setValorManualAnual}
                keyboardType="decimal-pad"
                placeholder="Ex: 10200"
              />
            ) : null}
          </>
        )}

      </SGCard>

      <SGCard title="Combustível" subtitle="Usado na estimativa de lucro da corrida">
        <SGInput
          label="Preço do combustível"
          value={fuelPrice}
          onChangeText={setFuelPrice}
          keyboardType="decimal-pad"
          placeholder="Ex: 5,89"
        />
        <SGInput
          label="Consumo médio (km/l)"
          value={fuelEfficiency}
          onChangeText={setFuelEfficiency}
          keyboardType="decimal-pad"
          placeholder="Ex: 11,5"
        />
        <Text style={styles.hint}>Esses valores são salvos no app e usados para estimar lucro por corrida.</Text>
        <SGButton
          label="Salvar configurações"
          onPress={onSaveConfig}
          loading={savingConfig}
          icon={<Ionicons name="save-outline" size={18} color="#fff" />}
        />
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hint: {
    color: colors.subtext,
    fontSize: 12,
  },
});
