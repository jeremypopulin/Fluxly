import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ✅ Helper to clear Supabase auth token(s) dynamically
const clearSupabaseAuthTokens = () => {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith("sb-") && key.includes("auth-token")) {
      localStorage.removeItem(key);
    }
  }
};

type User = {
  id: string;
  email: string;
  role?: string;
  name?: string;
  initials?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: any) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name, initials")
        .eq("id", supabaseUser.id)
        .single();

      return {
        ...supabaseUser,
        email: supabaseUser.email ?? "",
        role: profile?.role ?? null,
        name: profile?.name ?? "",
        initials: profile?.initials ?? "",
      };
    } catch (err) {
      console.warn("⚠️ Failed to fetch profile. Using basic user.");
      return {
        ...supabaseUser,
        email: supabaseUser.email,
        role: null,
        name: "",
        initials: "",
      };
    }
  };

  const validateSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        clearSupabaseAuthTokens(); // ✅ Clear stale tokens
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      const enrichedUser = await fetchUserProfile(data.session.user);
      setUser(enrichedUser);
    } catch (err) {
      console.error("💥 Session validation error:", err);
      clearSupabaseAuthTokens();
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const enrichedUser = await fetchUserProfile(session.user);
        setUser(enrichedUser);
      } else {
        clearSupabaseAuthTokens(); // ✅ Token cleared when signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session) {
        console.warn("❌ Login error:", error?.message);
        return false;
      }

      const enrichedUser = await fetchUserProfile(data.session.user);
      setUser(enrichedUser);
      return true;
    } catch (err) {
      console.error("💥 Login failed:", err);
      return false;
    }
  };

  const logout = async () => {
    clearSupabaseAuthTokens(); // ✅ Also clear on manual logout
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user?.role, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
