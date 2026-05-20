import { Platform } from "react-native";

const TOKEN_KEY = "checklisthub_token";
let nativeToken: string | null = null;

export async function getStoredToken() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  return nativeToken;
}

export async function setStoredToken(token: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  nativeToken = token;
}

export async function clearStoredToken() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }

  nativeToken = null;
}
