import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGButton } from "../../components/ui/SGButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { colors, spacing } from "../../constants/theme";
import { customersApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { CustomersStackParamList } from "../../navigation/types";
import type { Customer } from "../../types/api";

type Nav = NativeStackNavigationProp<CustomersStackParamList, "CustomersList">;

export function CustomersScreen() {
  const navigation = useNavigation<Nav>();
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      setCustomers(await customersApi.list(session.token));
    } catch {
      Alert.alert("Clientes", "Falha ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: number) => {
    if (!session?.token) {
      return;
    }
    try {
      await customersApi.remove(session.token, id);
      await load();
    } catch {
      Alert.alert("Clientes", "Não foi possível excluir cliente.");
    }
  };

  return (
    <Screen>
      <SGButton label="Novo cliente" onPress={() => navigation.navigate("CustomerForm")} />
      <SGButton label="Atualizar lista" onPress={load} loading={loading} variant="secondary" />
      {customers.length === 0 ? <EmptyState message="Nenhum cliente cadastrado." /> : null}
      {customers.map((customer) => (
        <SGCard key={customer.id} title={customer.name} subtitle={customer.email ?? "Sem e-mail"}>
          <Text style={styles.line}>Telefone: {customer.phone ?? "-"}</Text>
          <Text style={styles.line}>Notas: {customer.notes ?? "-"}</Text>
          <View style={styles.row}>
            <SGButton label="Editar" onPress={() => navigation.navigate("CustomerForm", { customer })} />
            <SGButton label="Excluir" variant="danger" onPress={() => remove(customer.id)} />
          </View>
        </SGCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: {
    color: colors.subtext,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
