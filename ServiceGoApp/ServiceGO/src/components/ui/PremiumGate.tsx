import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { SGCard } from "./SGCard";

interface PremiumGateProps {
  title: string;
  description: string;
}

export function PremiumGate({ title, description }: PremiumGateProps) {
  return (
    <SGCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.caption}>Disponível no plano Pro.</Text>
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
