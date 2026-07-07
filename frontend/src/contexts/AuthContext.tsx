import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/api';
import { authStorage } from '@/lib/utils';
import type { User } from '@/types/user';

/**
 * EAOP Auth Context.
 *
 * Holds the current user, the JWT, and login/logout actions. The JWT and
 * user are persisted to localStorage (simplified demo flow per FSMOD §16).
 *
 * On mount, the provider hydrates from localStorage so a page refresh
 * keeps the user signed in until the token actually expires.
 */

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = authStorage.getToken();
    const storedUser = authStorage.getUser<User>();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUserState(storedUser);
    }
    setIsInitializing(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await authService.login({ email, password });
    authStorage.setToken(newToken);
    authStorage.setUser(newUser);
    setToken(newToken);
    setUserState(newUser);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setToken(null);
    setUserState(null);
  }, []);

  const setUser = useCallback((next: User) => {
    authStorage.setUser(next);
    setUserState(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isInitializing,
      login,
      logout,
      setUser,
    }),
    [user, token, isInitializing, login, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}
