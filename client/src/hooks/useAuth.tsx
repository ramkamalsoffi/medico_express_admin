import { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useLogout, useProfile } from './useAuthQueries';
import type { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isProfileLoading: boolean;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Use React Query hooks
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: user, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile();

  const login = async (credentials: LoginCredentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // After successful login, navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      // Re-throw the error so LoginPage can handle it
      throw error;
    }
  };

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
      onError: () => {
        // Even if server logout fails, clear local state and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      },
    });
  };

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token') && !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading: loginMutation.isPending,
    isProfileLoading,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


