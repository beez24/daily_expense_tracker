"use client";

import { useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, SignupCredentials } from "@/types/auth";
import { getActiveSession, setActiveSession, authenticateUser, registerUser } from "@/lib/authStorage";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    const session = getActiveSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = useCallback((credentials: LoginCredentials) => {
    const result = authenticateUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signup = useCallback((credentials: SignupCredentials) => {
    const result = registerUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    setActiveSession(null);
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
