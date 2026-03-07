import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";

interface SGButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function SGButton({ label, onPress, variant = "primary", loading = false, icon }: SGButtonProps) {
  return (
    <Pressable
      style={[styles.base, variantStyles[variant], loading ? styles.disabled : null]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={styles.text}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.7,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryDark },
  danger: { backgroundColor: colors.danger },
});
