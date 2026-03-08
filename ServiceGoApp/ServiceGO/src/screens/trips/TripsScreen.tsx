import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HeaderHelpButton } from "../../components/ui/HeaderHelpButton";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGButton } from "../../components/ui/SGButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { colors, spacing } from "../../constants/theme";
import { tripStatusLabels, tripTypeLabels } from "../../constants/labels";
import { tripsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { currency, dateTime } from "../../utils/format";
import type { TripsStackParamList } from "../../navigation/types";
import type { Trip } from "../../types/api";

type Nav = NativeStackNavigationProp<TripsStackParamList, "TripsList">;

export function TripsScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      const data = await tripsApi.list(session.token);
      setTrips(data);
    } catch {
      Alert.alert("Corridas", "Falha ao carregar corridas.");
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
          title="Corridas"
          message="Aqui voce cadastra e acompanha viagens, define cliente, veiculo, horarios e pode abrir a corrida para edicao."
        />
      ),
    });
  }, [navigation]);

  const remove = async (id: number) => {
    if (!session?.token) {
      return;
    }
    try {
      await tripsApi.remove(session.token, id);
      await load();
    } catch {
      Alert.alert("Corridas", "Não foi possível excluir.");
    }
  };

  return (
    <Screen>
      <View style={styles.actions}>
        <SGButton
          label="Nova corrida"
          onPress={() => navigation.navigate("TripForm")}
          icon={<Ionicons name="add-circle-outline" size={18} color="#fff" />}
        />
        <SGButton
          label="Atualizar lista"
          onPress={load}
          loading={loading}
          variant="secondary"
          icon={<Ionicons name="refresh-circle-outline" size={18} color="#fff" />}
        />
      </View>

      {trips.length === 0 ? <EmptyState message="Nenhuma corrida cadastrada." /> : null}

      {trips.map((trip) => (
        <SGCard key={trip.id} title={`${trip.origin} -> ${trip.destination}`} subtitle={dateTime(trip.startAt)}>
          <StatusBadge label={tripStatusLabels[trip.status]} status={trip.status} />
          <Text style={styles.line}>Tipo: {tripTypeLabels[trip.tripType]}</Text>
          <Text style={styles.line}>Cliente: {trip.customerName ?? "Não vinculado"}</Text>
          <Text style={styles.line}>Veículo: {trip.veiculoModelo ?? "-"} ({trip.veiculoPlaca ?? "-"})</Text>
          <Text style={styles.line}>Previsto: {currency(trip.estimatedAmount)}</Text>
          <Text style={styles.line}>Real: {currency(trip.actualAmount)}</Text>
          <View style={styles.row}>
            <SGButton label="Editar" onPress={() => navigation.navigate("TripForm", { trip })} />
            <SGButton label="Excluir" onPress={() => remove(trip.id)} variant="danger" />
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

