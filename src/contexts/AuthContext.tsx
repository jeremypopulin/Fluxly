import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  email: string;
  role?: string;
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
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", supabaseUser.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      role: profile?.role ?? null,
      ...supabaseUser,
    };
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      console.warn("⚠️ Timeout fallback hit — unblocking UI");
      setLoading(false);
    }, 5000); // fallback in case Supabase hangs

    supabase.auth.getSession().then(async ({ data, error }) => {
      try {
        if (error) {
          console.error("Error getting session:", error.message);
        }

        const supabaseUser = data?.session?.user;
        if (supabaseUser) {
          const enrichedUser = await fetchUserProfile(supabaseUser);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error in getSession:", err);
        setUser(null);
      }
      setLoading(false);
      clearTimeout(timeout);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const supabaseUser = session?.user;
        if (supabaseUser) {
          const enrichedUser = await fetchUserProfile(supabaseUser);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error in onAuthStateChange:", err);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      console.error("Login error:", error?.message);
      return false;
    }
    const supabaseUser = data.session.user;
    const enrichedUser = await fetchUserProfile(supabaseUser);
    setUser(enrichedUser);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
