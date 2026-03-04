import React, { useState } from "react";
import { Alert } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { useAuth } from "../../context/AuthContext";
import { authApi, configuracaoApi } from "../../services/api";

export function SettingsScreen() {
  const { session, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [usuarioId, setUsuarioId] = useState("1");
  const [sincronizarCalendario, setSincronizarCalendario] = useState("true");
  const [lembreteAtivo, setLembreteAtivo] = useState("true");
  const [minutos, setMinutos] = useState("30");
  const [fusoHorario, setFusoHorario] = useState("America/Sao_Paulo");
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

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
    const usuarioIdValue = Number(usuarioId);
    const minutosValue = Number(minutos);
    if (!usuarioIdValue || !minutosValue) {
      Alert.alert("Configuração", "Informe usuário e minutos válidos.");
      return;
    }
    try {
      setSavingConfig(true);
      await configuracaoApi.update(session.token, usuarioIdValue, {
        sincronizarCalendario: sincronizarCalendario === "true",
        lembreteAtivo: lembreteAtivo === "true",
        minutosAntecedenciaLembrete: minutosValue,
        fusoHorario: fusoHorario.trim(),
      });
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

      <SGCard title="Configurações de agenda" subtitle="Atualiza /api/configuracoes-usuario/{usuarioId}">
        <SGInput label="Usuário ID" value={usuarioId} onChangeText={setUsuarioId} keyboardType="number-pad" />
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
        <SGButton label="Salvar configurações" onPress={onSaveConfig} loading={savingConfig} />
      </SGCard>
    </Screen>
  );
}
