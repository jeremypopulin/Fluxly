import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  email: string;
  role?: string;
  name?: string;
  initials?: string;
  [key: string]: any;
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
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, name, initials")
        .eq("id", supabaseUser.id)
        .single();

      if (error || !profile) {
        console.warn("⚠️ Profile not found or error:", error?.message);
        return {
          ...supabaseUser,
          email: supabaseUser.email,
          role: null,
          name: "",
          initials: "",
        };
      }

      return {
        ...supabaseUser,
        email: supabaseUser.email ?? "",
        role: profile.role ?? null,
        name: profile.name ?? "",
        initials: profile.initials ?? "",
      };
    } catch (err) {
      console.error("💥 Error fetching profile:", err);
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

      if (error || !data?.session) {
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      const enrichedUser = await fetchUserProfile(data.session.user);
      setUser(enrichedUser);
    } catch (err) {
      console.error("💥 Unexpected getSession error:", err);
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
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      console.error("Login error:", error?.message);
      return false;
    }

    const enrichedUser = await fetchUserProfile(data.session.user);
    setUser(enrichedUser);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user?.role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
