import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthResponseDto, LoginRequestDto, RegisterRequestDto, UserDto } from "@checklisthub/shared";

import * as api from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/tokenStorage";

type AuthContextValue = {
  token: string | null;
  user: UserDto | null;
  isLoading: boolean;
  signIn: (input: LoginRequestDto) => Promise<void>;
  signUp: (input: RegisterRequestDto) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = await getStoredToken();

      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await api.me(storedToken);
        if (isMounted) {
          setToken(storedToken);
          setUser(currentUser.data);
        }
      } catch {
        await clearStoredToken();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  async function applyAuth(response: AuthResponseDto) {
    await setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      signIn: async (input) => applyAuth(await api.login(input)),
      signUp: async (input) => applyAuth(await api.register(input)),
      signOut: async () => {
        await clearStoredToken();
        setToken(null);
        setUser(null);
      },
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
