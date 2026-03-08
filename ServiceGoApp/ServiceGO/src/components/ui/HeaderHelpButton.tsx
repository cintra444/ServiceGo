import React from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";

interface HeaderHelpButtonProps {
  title: string;
  message: string;
}

export function HeaderHelpButton({ title, message }: HeaderHelpButtonProps) {
  return (
    <Pressable onPress={() => Alert.alert(title, message)} style={styles.button} hitSlop={8}>
      <Ionicons name="help-circle-outline" size={22} color={colors.primaryDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
