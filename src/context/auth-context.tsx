import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface TierLimits {
  maxEntities: number;
  maxUniverses: number;
  maxProducts: number;
  monthlyCredits: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  credits: number;
  creditsResetAt: string | null;
  entityCount: number;
  limits: TierLimits;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/auth/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    // Redirect to Google OAuth
    window.location.href = '/auth/google';
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
