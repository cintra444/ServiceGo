import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HeaderHelpButton } from "../../components/ui/HeaderHelpButton";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGButton } from "../../components/ui/SGButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { colors, spacing } from "../../constants/theme";
import { veiculosApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { VehiclesStackParamList } from "../../navigation/types";
import type { Veiculo } from "../../types/api";

type Nav = NativeStackNavigationProp<VehiclesStackParamList, "VehiclesList">;

export function VehiclesScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setVeiculos(await veiculosApi.list(session.token));
    } catch {
      Alert.alert("Veículos", "Falha ao carregar veículos.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderHelpButton
          title="Veiculos"
          message="Aqui voce cadastra os veiculos usados nas corridas e despesas, com placa, modelo, ano e quilometragem."
        />
      ),
    });
  }, [navigation]);

  const remove = async (id: number) => {
    if (!session?.token) {
      return;
    }
    try {
      await veiculosApi.remove(session.token, id);
      await load();
    } catch {
      Alert.alert("Veículos", "Não foi possível excluir veículo.");
    }
  };

  return (
    <Screen>
      <View style={styles.actions}>
        <SGButton
          label="Novo veículo"
          onPress={() => navigation.navigate("VehicleForm")}
          icon={<Ionicons name="car-sport-outline" size={18} color="#fff" />}
        />
        <SGButton
          label="Atualizar lista"
          onPress={load}
          loading={loading}
          variant="secondary"
          icon={<Ionicons name="refresh-circle-outline" size={18} color="#fff" />}
        />
      </View>
      {veiculos.length === 0 ? <EmptyState message="Nenhum veículo cadastrado." /> : null}
      {veiculos.map((item) => (
        <SGCard key={item.id} title={`${item.modelo} - ${item.placa}`} subtitle={`Ano ${item.ano}`}>
          <Text style={styles.line}>Cor: {item.cor ?? "-"}</Text>
          <Text style={styles.line}>KM atual: {item.kmAtual}</Text>
          <Text style={styles.line}>Ativo: {item.ativo ? "Sim" : "Não"}</Text>
          <Text style={styles.line}>Dono: {item.donoNome ?? `ID ${item.donoUsuarioId}`}</Text>
          <View style={styles.row}>
            <SGButton label="Editar" onPress={() => navigation.navigate("VehicleForm", { veiculo: item })} />
            <SGButton label="Excluir" variant="danger" onPress={() => remove(item.id)} />
          </View>
        </SGCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.xl + spacing.md,
    marginBottom: spacing.xs,
    alignSelf: "center",
    width: "92%",
    gap: spacing.sm,
  },
  line: {
    color: colors.subtext,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
