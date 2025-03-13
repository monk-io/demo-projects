'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from './types';
import { useRouter } from 'next/navigation';
import { fetchUser } from './api';
import { getCookie } from './cookies';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    const getCurrentUser = async () => {
      try {
        const userData = await fetchUser('me');
        setUser(userData);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Failed to fetch user data');
        // Let the middleware handle redirect
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return null;
  return isAuthenticated ? <>{children}</> : null;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return null;
  return !isAuthenticated ? <>{children}</> : null;
} 