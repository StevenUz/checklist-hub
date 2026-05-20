import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { CHECKLISTHUB_API_URL?: string } | undefined;

export const CHECKLISTHUB_API_URL =
  process.env.EXPO_PUBLIC_CHECKLISTHUB_API_URL ??
  extra?.CHECKLISTHUB_API_URL ??
  "http://localhost:3000";
