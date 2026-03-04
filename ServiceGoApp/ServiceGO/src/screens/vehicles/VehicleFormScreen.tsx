import React, { useState } from "react";
import { Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { ChipSelect } from "../../components/ui/ChipSelect";
import { useAuth } from "../../context/AuthContext";
import { veiculosApi } from "../../services/api";
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
  const [donoUsuarioId, setDonoUsuarioId] = useState(
    veiculo?.donoUsuarioId ? String(veiculo.donoUsuarioId) : "1",
  );

  const submit = async () => {
    if (!session?.token || !modelo.trim() || !placa.trim()) {
      Alert.alert("Veículo", "Preencha modelo e placa.");
      return;
    }
    const payload = {
      modelo: modelo.trim(),
      placa: placa.trim().toUpperCase(),
      ano: Number(ano),
      cor: cleanText(cor),
      ativo: ativo === "true",
      kmAtual: parseNumber(kmAtual) ?? 0,
      donoUsuarioId: Number(donoUsuarioId),
    };
    if (!payload.ano || !payload.donoUsuarioId) {
      Alert.alert("Veículo", "Informe ano e dono do veículo (ID usuário).");
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
      <SGCard subtitle="donoUsuarioId deve ser um usuário existente no backend.">
        <SGInput label="Modelo" value={modelo} onChangeText={setModelo} />
        <SGInput label="Placa" value={placa} onChangeText={setPlaca} autoCapitalize="characters" />
        <SGInput label="Ano" value={ano} onChangeText={setAno} keyboardType="number-pad" />
        <SGInput label="Cor" value={cor ?? ""} onChangeText={setCor} />
        <SGInput label="KM atual" value={kmAtual} onChangeText={setKmAtual} keyboardType="decimal-pad" />
        <SGInput
          label="ID do dono (usuário)"
          value={donoUsuarioId}
          onChangeText={setDonoUsuarioId}
          keyboardType="number-pad"
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
        <SGButton label={veiculo ? "Atualizar veículo" : "Criar veículo"} onPress={submit} loading={saving} />
      </SGCard>
    </Screen>
  );
}
