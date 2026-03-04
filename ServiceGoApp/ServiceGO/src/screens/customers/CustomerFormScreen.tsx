import React, { useState } from "react";
import { Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { useAuth } from "../../context/AuthContext";
import { customersApi } from "../../services/api";
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

  const submit = async () => {
    if (!session?.token || !name.trim()) {
      Alert.alert("Cliente", "Informe o nome.");
      return;
    }
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
        <SGInput label="Nome" value={name} onChangeText={setName} />
        <SGInput label="Telefone" value={phone ?? ""} onChangeText={setPhone} />
        <SGInput label="E-mail" value={email ?? ""} onChangeText={setEmail} autoCapitalize="none" />
        <SGInput label="Observações" value={notes ?? ""} onChangeText={setNotes} multiline />
        <SGButton label={customer ? "Atualizar cliente" : "Criar cliente"} onPress={submit} loading={saving} />
      </SGCard>
    </Screen>
  );
}
