// lib/auth-context.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken, getToken } from "./api";

type Role = "admin" | "seller" | "installer";

export type Profile =
  | { role: "admin"; login?: string }
  | { role: "seller" | "installer"; phone: string; firstName?: string; lastName?: string };

type AuthContextType = {
  profile: Profile | null;
  loading: boolean;
  loginAdmin: (p: { login: string; password: string }) => Promise<void>;
  loginUser: (p: { role: "seller" | "installer"; phone: string; firstName: string; lastName: string }) => Promise<void>;
  registerSeller: (p: { firstName: string; lastName: string; phone: string; code: string }) => Promise<void>;
  registerInstaller: (p: { firstName: string; lastName: string; phone: string; code: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // первый прогон — пытаемся подтянуть профиль
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const { data } = await api.get("/auth/me");
        if (mounted) setProfile(data);
      } catch {
        setToken(null);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    boot();
    return () => {
      mounted = false;
    };
  }, []);

  // login admin
  const loginAdmin = async ({ login, password }: { login: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { role: "admin", login, password });
      setToken(data.token);
      setProfile({ role: "admin", login: data.login });
    } finally {
      setLoading(false);
    }
  };

  // login seller/installer (без регистрации)
  const loginUser = async (p: { role: "seller" | "installer"; phone: string; firstName: string; lastName: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        role: p.role,
        phone: p.phone,
        firstName: p.firstName,
        lastName: p.lastName,
      });
      setToken(data.token);
      setProfile({ role: p.role, phone: p.phone, firstName: p.firstName, lastName: p.lastName });
    } finally {
      setLoading(false);
    }
  };

  // register seller (демо код) → сразу логиним
  const registerSeller = async (p: { firstName: string; lastName: string; phone: string; code: string }) => {
    setLoading(true);
    try {
      await api.post("/auth/planfix/register-seller", p);
      await loginUser({ role: "seller", phone: p.phone, firstName: p.firstName, lastName: p.lastName });
    } finally {
      setLoading(false);
    }
  };

  // register installer → сразу логиним
  const registerInstaller = async (p: { firstName: string; lastName: string; phone: string; code: string }) => {
    setLoading(true);
    try {
      await api.post("/auth/planfix/register-installer", p);
      await loginUser({ role: "installer", phone: p.phone, firstName: p.firstName, lastName: p.lastName });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch {
      // игнор
    } finally {
      setToken(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      profile,
      loading,
      loginAdmin,
      loginUser,
      registerSeller,
      registerInstaller,
      logout,
    }),
    [profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
