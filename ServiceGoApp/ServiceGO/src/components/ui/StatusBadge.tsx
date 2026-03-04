import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";

const palette: Record<string, string> = {
  AGENDADA: colors.warning,
  EM_ANDAMENTO: colors.primary,
  CONCLUIDA: colors.success,
  CANCELADA: colors.danger,
  PENDENTE: colors.warning,
  PAGO_PARCIAL: colors.primary,
  PAGO: colors.success,
  CANCELADO: colors.danger,
  AGENDADO: colors.warning,
  CONCLUIDO: colors.success,
};

export function StatusBadge({ label, status }: { label: string; status: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: palette[status] ?? colors.primaryDark }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
