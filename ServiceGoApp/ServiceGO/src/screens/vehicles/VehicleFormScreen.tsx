import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { useAuth } from "../../context/AuthContext";
import { veiculosApi } from "../../services/api";
import { colors, spacing } from "../../constants/theme";
import { cleanText, parseNumber } from "../../utils/format";
import type { VehiclesStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<VehiclesStackParamList, "VehicleForm">;

export function VehicleFormScreen({ navigation, route }: Props) {
  const veiculo = route.params?.veiculo;
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [modelo, setModelo] = useState(veiculo?.modelo ?? "");
  const [placa, setPlaca] = useState(veiculo?.placa ?? "");
  const [ano, setAno] = useState(veiculo?.ano ? String(veiculo.ano) : "");
  const [cor, setCor] = useState(veiculo?.cor ?? "");
  const [ativo, setAtivo] = useState(veiculo?.ativo ? "true" : "false");
  const [kmAtual, setKmAtual] = useState(veiculo?.kmAtual ? String(veiculo.kmAtual) : "0");

  const submit = async () => {
    if (!session?.token || !modelo.trim() || !placa.trim()) {
      Alert.alert("Veículo", "Preencha modelo e placa.");
      return;
    }
    if (!session.userId) {
      Alert.alert("Veículo", "Não foi possível identificar o motorista da sessão.");
      return;
    }
    const payload = {
      modelo: modelo.trim(),
      placa: placa.trim().toUpperCase(),
      ano: Number(ano),
      cor: cleanText(cor),
      ativo: ativo === "true",
      kmAtual: parseNumber(kmAtual) ?? 0,
      donoUsuarioId: session.userId,
    };
    if (!payload.ano) {
      Alert.alert("Veículo", "Informe um ano válido.");
      return;
    }
    try {
      setSaving(true);
      if (veiculo?.id) {
        await veiculosApi.update(session.token, veiculo.id, payload);
      } else {
        await veiculosApi.create(session.token, payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Veículo", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SGCard>
        <View style={styles.ownerRow}>
          <Ionicons name="person-circle-outline" size={18} color={colors.subtext} />
          <Text style={styles.ownerText}>Motorista vinculado: {veiculo?.donoNome ?? session?.email ?? "-"}</Text>
        </View>
        <SGInput label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex: Onix, HB20, Corolla" />
        <SGInput
          label="Placa"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
          placeholder="Ex: ABC1D23"
        />
        <SGInput label="Ano" value={ano} onChangeText={setAno} keyboardType="number-pad" />
        <SGInput label="Cor" value={cor ?? ""} onChangeText={setCor} placeholder="Ex: Branco, Prata, Preto" />
        <SGInput
          label="KM atual"
          value={kmAtual}
          onChangeText={setKmAtual}
          keyboardType="decimal-pad"
          placeholder="Ex: 45230"
        />
        <ChipSelect
          label="Ativo"
          value={ativo}
          onChange={setAtivo}
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
        />
        <SGButton
          label={veiculo ? "Atualizar veículo" : "Criar veículo"}
          onPress={submit}
          loading={saving}
          icon={<Ionicons name={veiculo ? "create-outline" : "car-sport-outline"} size={18} color="#fff" />}
        />
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ownerText: {
    color: colors.subtext,
    fontSize: 12,
  },
});
