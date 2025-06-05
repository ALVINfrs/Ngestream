"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, type UserProfile, type Subscription } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Initial session:", session?.user?.email);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserData(session.user.id);
        // Only redirect to home on sign in, not on token refresh
        if (event === "SIGNED_IN") {
          router.push("/");
        }
      } else {
        setProfile(null);
        setSubscription(null);
        // Only redirect to auth on sign out
        if (event === "SIGNED_OUT") {
          router.push("/auth");
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      console.log("Fetching user data for:", userId);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      } else {
        console.log("Profile data:", profileData);
        setProfile(profileData);
      }

      // Fetch subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (subError) {
        console.error("Subscription fetch error:", subError);
      } else {
        console.log("Subscription data:", subscriptionData);
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: "No user logged in" };

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (data) {
      setProfile(data);
    }

    return { data, error };
  };

  const value = {
    user,
    profile,
    subscription,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
