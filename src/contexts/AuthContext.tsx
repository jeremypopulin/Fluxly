import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

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
        console.error("❌ Failed to load profile:", error?.message);
        return {
          ...supabaseUser,
          email: supabaseUser.email,
          role: null,
          name: '',
          initials: '',
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
      console.error("💥 Unexpected error in fetchUserProfile:", err);
      return {
        ...supabaseUser,
        email: supabaseUser.email,
        role: null,
        name: '',
        initials: '',
      };
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ getSession error:", error.message);
          setUser(null);
        } else if (data?.session?.user) {
          const enrichedUser = await fetchUserProfile(data.session.user);
          console.log("👤 user:", enrichedUser); // ✅ Debug
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("💥 Unexpected getSession error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const supabaseUser = session?.user;
        if (supabaseUser) {
          const enrichedUser = await fetchUserProfile(supabaseUser);
          console.log("👤 user (onAuthChange):", enrichedUser); // ✅ Debug
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("💥 Error in onAuthStateChange:", err);
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
    const supabaseUser = data.session.user;
    const enrichedUser = await fetchUserProfile(supabaseUser);
    console.log("👤 user (after login):", enrichedUser); // ✅ Debug
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
