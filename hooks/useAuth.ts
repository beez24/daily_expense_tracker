"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { LoginCredentials, SignupCredentials } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

function supabaseUserToAppUser(supabaseUser: { id: string; email?: string; user_metadata?: { name?: string }; created_at?: string } | null): User | null {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name ?? supabaseUser.email?.split("@")[0] ?? "User",
    email: supabaseUser.email ?? "",
    createdAt: supabaseUser.created_at ?? new Date().toISOString(),
  };
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(supabaseUserToAppUser(session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(supabaseUserToAppUser(session?.user ?? null));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return { success: false, message: "Please confirm your email address before signing in. Check your inbox for a confirmation link." };
      }
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, message: "Incorrect email or password. Please try again." };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: "Signed in successfully!" };
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const { error } = await supabase.auth.signUp({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      options: {
        data: { name: credentials.name.trim() },
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        return { success: false, message: "An account with this email already exists. Please sign in." };
      }
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Account created! Please check your email and click the confirmation link to activate your account.",
    };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };
}
