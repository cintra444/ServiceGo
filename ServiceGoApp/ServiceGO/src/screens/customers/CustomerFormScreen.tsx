import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { useAuth } from "../../context/AuthContext";
import { customersApi } from "../../services/api";
import { colors, spacing } from "../../constants/theme";
import { cleanText } from "../../utils/format";
import type { CustomersStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<CustomersStackParamList, "CustomerForm">;

export function CustomerFormScreen({ navigation, route }: Props) {
  const customer = route.params?.customer;
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const submit = async () => {
    if (!session?.token || !name.trim()) {
      Alert.alert("Cliente", "Informe o nome.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("E-mail inválido.");
      Alert.alert("Cliente", "Informe um e-mail válido ou deixe em branco.");
      return;
    }
    setEmailError(null);

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        phone: cleanText(phone),
        email: cleanText(email),
        notes: cleanText(notes),
      };
      if (customer?.id) {
        await customersApi.update(session.token, customer.id, payload);
      } else {
        await customersApi.create(session.token, payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Cliente", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <SGCard>
        <View style={styles.tipRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.subtext} />
          <Text style={styles.tipText}>Somente nome é obrigatório. Telefone e e-mail são opcionais.</Text>
        </View>

        <SGInput label="Nome" value={name} onChangeText={setName} placeholder="Ex: João da Silva" autoCapitalize="words" />
        <SGInput
          label="Telefone"
          value={phone ?? ""}
          onChangeText={setPhone}
          placeholder="Ex: (11) 99999-9999"
          keyboardType="phone-pad"
        />
        <SGInput
          label="E-mail"
          value={email ?? ""}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Ex: cliente@email.com"
        />
        {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
        <SGInput label="Observações" value={notes ?? ""} onChangeText={setNotes} multiline />
        <SGButton
          label={customer ? "Atualizar cliente" : "Criar cliente"}
          onPress={submit}
          loading={saving}
          icon={<Ionicons name={customer ? "create-outline" : "person-add-outline"} size={18} color="#fff" />}
        />
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tipText: {
    color: colors.subtext,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -spacing.xs,
  },
});
