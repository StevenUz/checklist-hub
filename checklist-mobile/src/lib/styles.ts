import { StyleSheet } from "react-native";

export const colors = {
  background: "#f8fafc",
  panel: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  line: "#dbe3ee",
  accent: "#047857",
  accentDark: "#065f46",
  danger: "#be123c",
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    gap: 14,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButton: {
    backgroundColor: colors.text,
  },
  outlineButton: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  outlineButtonText: {
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  muted: {
    color: colors.muted,
  },
});
