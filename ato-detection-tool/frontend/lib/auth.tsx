"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, User, AuthResponse } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("ato_token");
    const savedUser = localStorage.getItem("ato_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleAuth = (res: AuthResponse) => {
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("ato_token", res.access_token);
    localStorage.setItem("ato_user", JSON.stringify(res.user));
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    handleAuth(res);
  };

  const register = async (email: string, password: string, role = "user") => {
    const res = await api.register(email, password, role);
    handleAuth(res);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ato_token");
    localStorage.removeItem("ato_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
