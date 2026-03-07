import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGInput } from "../../components/ui/SGInput";
import { SGButton } from "../../components/ui/SGButton";
import { colors, spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/apiClient";
import serviceGoLogo from "../../assets/ServiceGO.png";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@servicego.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    console.log("[ServiceGO][LoginScreen] Submit pressed:", { email: email.trim() });
    try {
      setLoading(true);
      await login(email.trim(), password);
      console.log("[ServiceGO][LoginScreen] Login flow finished successfully");
    } catch (error) {
      console.error("[ServiceGO][LoginScreen] Login flow failed:", error);
      const message = error instanceof ApiError ? error.message : "Não foi possível realizar o login";
      Alert.alert("Falha no login", message);
    } finally {
      console.log("[ServiceGO][LoginScreen] Submit finished");
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Image source={serviceGoLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>ServiceGo</Text>
          <Text style={styles.subtitle}>Gestão profissional de corridas</Text>
        </View>
        <SGCard style={styles.loginCard}>
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
  header: {
    alignItems: "center",
    gap: spacing.xs,
  },
  logo: {
    width: 210,
    height: 110,
  },
  loginCard: {
    backgroundColor: colors.bg,
    borderWidth: 0,
    borderColor: "transparent",
    shadowColor: "transparent",
    elevation: 0,
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: "#073B5A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#1A4E75",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: 12,
    color: "#1A4E75",
  },
});
