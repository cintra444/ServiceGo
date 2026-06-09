import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { logEvent } from "@/core/logging/logger";
import { processScreenSnapshot } from "@/modules/smart-driver/application/orchestrators/SmartDriverOrchestrator";
import { smartDriverNative } from "@/modules/smart-driver/infrastructure/native/smartDriverNative";
import {
  addBlockedNeighborhood,
  getBlockedNeighborhoods,
  removeBlockedNeighborhood,
} from "@/modules/smart-driver/infrastructure/storage/blockedNeighborhoodsStorage";
import { ScreenTextSnapshot, SmartDriverState } from "@/modules/smart-driver/types";

interface SmartDriverContextValue {
  state: SmartDriverState;
  loading: boolean;
  addNeighborhood(name: string): Promise<void>;
  removeNeighborhood(name: string): Promise<void>;
  startObserving(): Promise<void>;
  stopObserving(): Promise<void>;
  runManualAnalysis(text: string): Promise<void>;
}

const initialState: SmartDriverState = {
  accessibilityConnected: false,
  lastSnapshot: null,
  lastRideCandidate: null,
  lastNeighborhoods: null,
  lastRuleEvaluation: null,
  blockedNeighborhoods: [],
};

const SmartDriverContext = createContext<SmartDriverContextValue | undefined>(undefined);

export function SmartDriverProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<SmartDriverState>(initialState);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let active = true;

    getBlockedNeighborhoods()
      .then(items => {
        if (!active) {
          return;
        }

        setState(current => ({ ...current, blockedNeighborhoods: items }));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const unsubscribe = smartDriverNative.subscribeToSnapshots((snapshot: ScreenTextSnapshot) => {
      setState(current => ({ ...current, accessibilityConnected: true, lastSnapshot: snapshot }));

      void processScreenSnapshot(snapshot, stateRef.current)
        .then(partial => {
          setState(updated => ({ ...updated, ...partial, accessibilityConnected: true }));
        })
        .catch(error => {
          logEvent("error", "orchestrator", "Falha ao processar snapshot.", {
            error: error instanceof Error ? error.message : String(error),
          });
        });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<SmartDriverContextValue>(
    () => ({
      state,
      loading,
      async addNeighborhood(name: string) {
        const items = await addBlockedNeighborhood(name);
        setState(current => ({ ...current, blockedNeighborhoods: items }));
      },
      async removeNeighborhood(name: string) {
        const items = await removeBlockedNeighborhood(name);
        setState(current => ({ ...current, blockedNeighborhoods: items }));
      },
      async startObserving() {
        await smartDriverNative.startObserving();
        setState(current => ({ ...current, accessibilityConnected: true }));
        logEvent("info", "native", "Observacao iniciada.");
      },
      async stopObserving() {
        await smartDriverNative.stopObserving();
        await smartDriverNative.hideOverlay();
        setState(current => ({ ...current, accessibilityConnected: false }));
        logEvent("info", "native", "Observacao pausada.");
      },
      async runManualAnalysis(text: string) {
        const trimmedText = text.trim();
        if (!trimmedText) {
          return;
        }

        const snapshot: ScreenTextSnapshot = {
          packageName: "debug.manual",
          eventType: "TYPE_DEBUG_MANUAL",
          capturedAt: new Date().toISOString(),
          combinedText: trimmedText,
          nodes: trimmedText
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => ({
              text: line,
              viewId: null,
              className: "debug.TextNode",
              contentDescription: null,
            })),
        };

        logEvent("info", "debug", "Analise manual disparada pela interface.", {
          textLength: trimmedText.length,
        });

        const partial = await processScreenSnapshot(snapshot, stateRef.current);
        setState(updated => ({
          ...updated,
          ...partial,
          lastSnapshot: snapshot,
        }));
      },
    }),
    [loading, state],
  );

  return <SmartDriverContext.Provider value={value}>{children}</SmartDriverContext.Provider>;
}

export function useSmartDriverContext() {
  const context = useContext(SmartDriverContext);
  if (!context) {
    throw new Error("useSmartDriverContext deve ser usado dentro de SmartDriverProvider.");
  }

  return context;
}
