import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeNeighborhood } from "@/modules/smart-driver/utils/text";

const STORAGE_KEY = "@servicego-smart-driver/blocked-neighborhoods";

export async function getBlockedNeighborhoods() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(item => typeof item === "string")
      .map(normalizeNeighborhood)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function saveBlockedNeighborhoods(items: string[]) {
  const unique = Array.from(new Set(items.map(normalizeNeighborhood).filter(Boolean)));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export async function addBlockedNeighborhood(name: string) {
  const current = await getBlockedNeighborhoods();
  return saveBlockedNeighborhoods([...current, name]);
}

export async function removeBlockedNeighborhood(name: string) {
  const normalized = normalizeNeighborhood(name);
  const current = await getBlockedNeighborhoods();
  return saveBlockedNeighborhoods(current.filter(item => item !== normalized));
}

