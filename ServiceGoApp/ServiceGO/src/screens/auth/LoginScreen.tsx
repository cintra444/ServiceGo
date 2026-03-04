import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { colors, spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/apiClient";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@servicego.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Não foi possível realizar o login";
      Alert.alert("Falha no login", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.wrapper}>
        <Text style={styles.brand}>ServiceGo</Text>
        <Text style={styles.subtitle}>Gestão profissional de corridas</Text>
        <SGCard>
          <SGInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
          />
          <SGInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Sua senha"
          />
          <SGButton label="Entrar" onPress={onSubmit} loading={loading} />
          <Text style={styles.hint}>
            Dica: para emulador Android, o app usa `http://10.0.2.2:8080` como backend.
          </Text>
        </SGCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  subtitle: {
    fontSize: 15,
    color: colors.subtext,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: 12,
    color: colors.subtext,
  },
});
