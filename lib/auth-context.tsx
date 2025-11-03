import { createContext, useContext, useEffect, useState } from "react";

type Profile = { role: "seller"|"installer"; phone: string } | null;
type Ctx = { profile: Profile; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; };

const AuthCtx = createContext<Ctx>({ profile: null, loading: true, refresh: async()=>{}, logout: async()=>{} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const r = await fetch("/api/auth/me");
    const j = await r.json();
    setProfile(j.ok ? j.profile : null);
  }

  useEffect(() => {
    setLoading(true);
    refresh().finally(()=>setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setProfile(null);
  }

  return (
    <AuthCtx.Provider value={{ profile, loading, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
