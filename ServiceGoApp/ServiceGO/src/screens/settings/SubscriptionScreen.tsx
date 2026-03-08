import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { SGCard } from "../../components/ui/SGCard";
import { SGButton } from "../../components/ui/SGButton";
import { colors, spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import type { SubscriptionPlan } from "../../types/api";
import { dateOnly } from "../../utils/format";
import { hasPremiumAccess } from "../../utils/plan";

const planFeatureList = [
  "Calculadora de lucro em tempo real",
  "Insights automáticos de ganhos",
  "Previsão de faturamento",
  "Relatório financeiro consolidado",
  "Integração com calendário do aparelho",
];

export function SubscriptionScreen() {
  const { session } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | undefined>(session?.plan);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPlan(session?.plan);
  }, [session?.plan]);

  const refreshPlan = async () => {
    if (!session?.token) {
      return;
    }
    try {
      setLoading(true);
      const latestPlan = await authApi.mePlan(session.token);
      setPlan(latestPlan);
    } catch {
      Alert.alert("Plano", "Não foi possível atualizar o plano.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!plan) {
      return "Plano indisponível";
    }
    if (plan.status === "TRIAL") {
      return "Teste Pro";
    }
    if (plan.status === "ACTIVE") {
      return "Pro ativo";
    }
    if (plan.status === "EXPIRED") {
      return "Pro expirado";
    }
    return "Assinatura cancelada";
  }, [plan]);

  const expiryText = useMemo(() => {
    if (!plan) {
      return "Faça login novamente para carregar o plano.";
    }
    if (plan.status === "TRIAL" && plan.trialEndsAt) {
      return `Teste disponível até ${dateOnly(plan.trialEndsAt)}.`;
    }
    if (plan.status === "ACTIVE" && plan.subscriptionEndsAt) {
      return `Renovação válida até ${dateOnly(plan.subscriptionEndsAt)}.`;
    }
    if (hasPremiumAccess(plan)) {
      return "Seu acesso Pro está liberado no momento.";
    }
    return "A cobrança pela loja será integrada depois da configuração das contas da Play Store e App Store.";
  }, [plan]);

  return (
    <Screen>
      <SGCard title="Plano atual" subtitle={session?.email ?? "Conta"}>
        <View style={styles.planHeader}>
          <Ionicons
            name={hasPremiumAccess(plan) ? "diamond-outline" : "lock-closed-outline"}
            size={18}
            color={hasPremiumAccess(plan) ? colors.primaryDark : colors.accent}
          />
          <Text style={styles.planTitle}>{plan?.type === "PRO" ? "ServiceGO Pro" : "ServiceGO Free"}</Text>
        </View>
        <Text style={styles.line}>Status: {statusLabel}</Text>
        <Text style={styles.line}>{expiryText}</Text>
        <SGButton
          label="Atualizar plano"
          onPress={refreshPlan}
          loading={loading}
          variant="secondary"
          icon={<Ionicons name="refresh-circle-outline" size={18} color="#fff" />}
        />
      </SGCard>

      <SGCard title="O que o Pro libera" subtitle="Recursos avançados do app">
        {planFeatureList.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.line}>{feature}</Text>
          </View>
        ))}
      </SGCard>

      <SGCard title="Assinatura" subtitle="Preparação para as lojas">
        <Text style={styles.line}>
          A tela já está pronta para o fluxo de assinatura. A compra real será conectada quando você configurar a conta de
          desenvolvedor e os produtos na Play Store e na App Store.
        </Text>
        <Text style={styles.hint}>
          Até lá, seu ambiente pode continuar em teste com acesso Pro via plano manual ou período de trial.
        </Text>
      </SGCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  planTitle: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "700",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  line: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  hint: {
    color: colors.subtext,
    fontSize: 12,
  },
});
