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
      if (!supabaseUser?.id) throw new Error("Missing user ID");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, name, initials")
        .eq("id", supabaseUser.id)
        .single();

      if (error || !profile) {
        console.warn("No profile found:", error);
        return {
          ...supabaseUser,
          email: supabaseUser.email ?? "",
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
      console.error("Failed to fetch profile:", err);
      return {
        ...supabaseUser,
        email: supabaseUser.email ?? "",
        role: null,
        name: "",
        initials: "",
      };
    }
  };

  const handleSessionLoad = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        console.warn("Invalid or expired session");
        await supabase.auth.signOut(); // Clean localStorage/session
        setUser(null);
      } else {
        const enrichedUser = await fetchUserProfile(data.session.user);
        if (!enrichedUser.role) {
          console.warn("User exists but no role; signing out");
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(enrichedUser);
        }
      }
    } catch (err) {
      console.error("Error loading session:", err);
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSessionLoad();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const enrichedUser = await fetchUserProfile(session.user);
        if (!enrichedUser.role) {
          console.warn("Logged in but no role — logging out");
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(enrichedUser);
        }
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
    if (!enrichedUser.role) {
      console.warn("Login succeeded but no role; signing out");
      await supabase.auth.signOut();
      return false;
    }
    setUser(enrichedUser);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user?.role, login, logout, loading }}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
