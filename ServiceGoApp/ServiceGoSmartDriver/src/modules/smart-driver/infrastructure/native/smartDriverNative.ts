import {
  NativeEventEmitter,
  NativeModules,
  Platform,
} from "react-native";

import { ScreenTextSnapshot } from "@/modules/smart-driver/types";

type SnapshotListener = (snapshot: ScreenTextSnapshot) => void;

interface SmartDriverNativeModule {
  startObserving(): Promise<void>;
  stopObserving(): Promise<void>;
  showOverlay(message: string): Promise<void>;
  hideOverlay(): Promise<void>;
  openAccessibilitySettings(): Promise<void>;
  openOverlaySettings(): Promise<void>;
}

const LINKING_ERROR =
  "SmartDriverModule nao esta disponivel. Verifique se o app Android nativo foi compilado.";

const nativeModule = NativeModules.SmartDriverModule as SmartDriverNativeModule | undefined;

const eventEmitter = nativeModule ? new NativeEventEmitter(NativeModules.SmartDriverModule) : null;

export const smartDriverNative = {
  async startObserving() {
    if (!nativeModule) {
      throw new Error(LINKING_ERROR);
    }

    return nativeModule.startObserving();
  },
  async stopObserving() {
    if (!nativeModule) {
      throw new Error(LINKING_ERROR);
    }

    return nativeModule.stopObserving();
  },
  async showOverlay(message: string) {
    if (!nativeModule) {
      throw new Error(LINKING_ERROR);
    }

    return nativeModule.showOverlay(message);
  },
  async hideOverlay() {
    if (!nativeModule) {
      throw new Error(LINKING_ERROR);
    }

    return nativeModule.hideOverlay();
  },
  async openAccessibilitySettings() {
    if (!nativeModule) {
      throw new Error(LINKING_ERROR);
    }

    return nativeModule.openAccessibilitySettings();
  },
  async openOverlaySettings() {
    if (!nativeModule) {
      throw new Error(LINKING_ERROR);
    }

    return nativeModule.openOverlaySettings();
  },
  subscribeToSnapshots(listener: SnapshotListener) {
    if (Platform.OS !== "android" || !eventEmitter) {
      return () => undefined;
    }

    const subscription = eventEmitter.addListener("SmartDriverSnapshot", listener);
    return () => subscription.remove();
  },
};

