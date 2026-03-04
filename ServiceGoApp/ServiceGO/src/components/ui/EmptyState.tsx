import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../constants/theme";

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.lg,
    alignItems: "center",
  },
  text: {
    color: colors.subtext,
    textAlign: "center",
  },
});
