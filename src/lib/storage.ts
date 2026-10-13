import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/** Token storage: Keychain/Keystore on devices, localStorage on web (preview only). */
export async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}
export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    /* ignore */
  }
}
export async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") localStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
}
