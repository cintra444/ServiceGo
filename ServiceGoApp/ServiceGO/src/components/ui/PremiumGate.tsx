import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing } from "../../constants/theme";
import { SGCard } from "./SGCard";
import { SGButton } from "./SGButton";

interface PremiumGateProps {
  title: string;
  description: string;
}

export function PremiumGate({ title, description }: PremiumGateProps) {
  const navigation = useNavigation<any>();

  const openSubscription = () => {
    navigation.getParent()?.navigate("AjustesTab", { screen: "Subscription" });
  };

  return (
    <SGCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.caption}>Disponível no plano Pro.</Text>
      <SGButton
        label="Ver plano Pro"
        onPress={openSubscription}
        variant="secondary"
        icon={<Ionicons name="diamond-outline" size={18} color="#fff" />}
      />
    </SGCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF7ED",
    borderColor: "#F4C27A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "700",
  },
  description: {
    color: colors.text,
    fontSize: 13,
  },
  caption: {
    color: colors.subtext,
    fontSize: 12,
  },
});
