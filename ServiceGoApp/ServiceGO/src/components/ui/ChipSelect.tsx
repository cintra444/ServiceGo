import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";

export interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (next: string) => void;
}

export function ChipSelect({ label, value, options, onChange }: ChipSelectProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrap}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, selected ? styles.selected : null]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.text, selected ? styles.selectedText : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: "#fff",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  selectedText: {
    color: "#fff",
  },
});
