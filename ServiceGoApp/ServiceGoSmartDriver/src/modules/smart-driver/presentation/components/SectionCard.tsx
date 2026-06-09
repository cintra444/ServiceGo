import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
});

