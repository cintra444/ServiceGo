import { smartDriverNative } from "@/modules/smart-driver/infrastructure/native/smartDriverNative";

export const smartDriverPermissions = {
  openAccessibilitySettings: () => smartDriverNative.openAccessibilitySettings(),
  openOverlaySettings: () => smartDriverNative.openOverlaySettings(),
};

