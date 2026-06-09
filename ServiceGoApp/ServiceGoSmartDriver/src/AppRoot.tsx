import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";

import { SmartDriverHomeScreen } from "@/modules/smart-driver/presentation/screens/SmartDriverHomeScreen";
import { SmartDriverProvider } from "@/modules/smart-driver/presentation/providers/SmartDriverProvider";

export function AppRoot() {
  return (
    <SmartDriverProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <SmartDriverHomeScreen />
      </SafeAreaView>
    </SmartDriverProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
});

