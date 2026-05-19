"use server";

import { redirect } from "next/navigation";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { loginUser, registerUser } from "@/services/authService";

export type AuthFormState = {
  error?: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await loginUser({
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  await setSessionCookie(result.user);
  redirect("/");
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await registerUser({
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  await setSessionCookie(result.user);
  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
