import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, supabase } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session) {
                // Sync OAuth tokens and profile info
                await api.syncUserFromSession(session);
            }
            const currentUser = await api.getCurrentUser();
            setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await api.login(email, pass);
  };

  const signUp = async (email: string, pass: string) => {
    await api.signUp(email, pass);
  }

  const logout = () => {
    api.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};