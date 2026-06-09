import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { smartDriverPermissions } from "@/core/permissions/smartDriverPermissions";
import { useSmartDriver } from "@/modules/smart-driver/presentation/hooks/useSmartDriver";
import { SectionCard } from "@/modules/smart-driver/presentation/components/SectionCard";

export function SmartDriverHomeScreen() {
  const {
    state,
    logs,
    loading,
    addNeighborhood,
    removeNeighborhood,
    startObserving,
    stopObserving,
    runManualAnalysis,
  } = useSmartDriver();
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [manualText, setManualText] = useState(
    "UberX\nDestino: Jardim Ana Paula\nViagem de 7 km\nR$ 18,50",
  );

  const handleAddNeighborhood = async () => {
    if (!neighborhoodName.trim()) {
      return;
    }

    await addNeighborhood(neighborhoodName);
    setNeighborhoodName("");
  };

  const toggleObserving = async () => {
    try {
      if (state.accessibilityConnected) {
        await stopObserving();
      } else {
        await startObserving();
      }
    } catch (error) {
      Alert.alert(
        "Smart Driver",
        error instanceof Error ? error.message : "Nao foi possivel alterar o servico.",
      );
    }
  };

  const handleManualAnalysis = async () => {
    try {
      await runManualAnalysis(manualText);
    } catch (error) {
      Alert.alert(
        "Smart Driver",
        error instanceof Error ? error.message : "Nao foi possivel analisar o texto manual.",
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>ServiceGo Smart Driver</Text>
      <Text style={styles.title}>Diagnostico do MVP Android</Text>
      <Text style={styles.subtitle}>
        Accessibility Service + parser de bairros + overlay de alerta.
      </Text>

      <SectionCard title="Status">
        <Text style={styles.label}>
          Observacao ativa:{" "}
          <Text style={styles.value}>{state.accessibilityConnected ? "SIM" : "NAO"}</Text>
        </Text>
        <Text style={styles.label}>
          Bairros bloqueados: <Text style={styles.value}>{state.blockedNeighborhoods.length}</Text>
        </Text>
        <Pressable style={styles.primaryButton} onPress={toggleObserving}>
          <Text style={styles.primaryButtonText}>
            {state.accessibilityConnected ? "Parar observacao" : "Iniciar observacao"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={smartDriverPermissions.openAccessibilitySettings}
        >
          <Text style={styles.secondaryButtonText}>Abrir acessibilidade</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={smartDriverPermissions.openOverlaySettings}
        >
          <Text style={styles.secondaryButtonText}>Abrir permissao de overlay</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Bairros bloqueados">
        <TextInput
          placeholder="Ex.: Jardim Ana Paula"
          placeholderTextColor="#64748B"
          style={styles.input}
          value={neighborhoodName}
          onChangeText={setNeighborhoodName}
        />
        <Pressable style={styles.primaryButton} onPress={handleAddNeighborhood}>
          <Text style={styles.primaryButtonText}>Adicionar bairro</Text>
        </Pressable>
        <View style={styles.chips}>
          {state.blockedNeighborhoods.map(item => (
            <Pressable
              key={item}
              style={styles.chip}
              onPress={() => void removeNeighborhood(item)}
            >
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
          {!state.blockedNeighborhoods.length && !loading ? (
            <Text style={styles.mutedText}>Nenhum bairro bloqueado cadastrado ainda.</Text>
          ) : null}
        </View>
      </SectionCard>

      <SectionCard title="Ultima analise">
        <Text style={styles.label}>
          Corrida detectada:{" "}
          <Text style={styles.value}>{state.lastRideCandidate ? "SIM" : "NAO"}</Text>
        </Text>
        <Text style={styles.label}>
          Bairro origem:{" "}
          <Text style={styles.value}>{state.lastNeighborhoods?.origin?.label ?? "-"}</Text>
        </Text>
        <Text style={styles.label}>
          Bairro destino:{" "}
          <Text style={styles.value}>{state.lastNeighborhoods?.destination?.label ?? "-"}</Text>
        </Text>
        <Text style={styles.label}>
          Regra acionada:{" "}
          <Text style={styles.value}>
            {state.lastRuleEvaluation?.blocked ? "BLOQUEAR" : "LIBERAR"}
          </Text>
        </Text>
        <Text style={styles.preview}>
          {state.lastSnapshot?.combinedText ?? "Aguardando textos vindos da acessibilidade..."}
        </Text>
      </SectionCard>

      <SectionCard title="Teste manual">
        <Text style={styles.mutedText}>
          Cole aqui um texto visivel da Uber/99 para validar detector, parser e regras sem usar o
          servico de acessibilidade.
        </Text>
        <TextInput
          multiline
          value={manualText}
          onChangeText={setManualText}
          style={[styles.input, styles.textArea]}
          placeholder="Ex.: Destino: Jardim Ana Paula"
          placeholderTextColor="#64748B"
          textAlignVertical="top"
        />
        <Pressable style={styles.primaryButton} onPress={handleManualAnalysis}>
          <Text style={styles.primaryButtonText}>Rodar analise manual</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Logs">
        {logs.slice(0, 12).map(entry => (
          <View key={entry.id} style={styles.logItem}>
            <Text style={styles.logTitle}>
              [{entry.level.toUpperCase()}] {entry.category}
            </Text>
            <Text style={styles.logMessage}>{entry.message}</Text>
          </View>
        ))}
        {!logs.length ? (
          <Text style={styles.mutedText}>Os logs internos aparecerao aqui.</Text>
        ) : null}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: "#CBD5E1",
    fontSize: 15,
  },
  value: {
    color: "#F8FAFC",
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F8FAFC",
    backgroundColor: "#020617",
  },
  textArea: {
    minHeight: 140,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#1D4ED8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: "#EFF6FF",
    fontWeight: "600",
  },
  mutedText: {
    color: "#94A3B8",
  },
  preview: {
    color: "#E2E8F0",
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
  },
  logItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1E293B",
    paddingBottom: 8,
    gap: 4,
  },
  logTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 12,
  },
  logMessage: {
    color: "#CBD5E1",
    fontSize: 13,
  },
});
