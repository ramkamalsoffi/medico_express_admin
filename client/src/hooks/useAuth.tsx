import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired immediately
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            // Set timer for remaining time
            const timeUntilExpire = (decoded.exp - currentTime) * 1000;
            const timer = setTimeout(() => {
              // Token expired in background
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
              // Optional: Show toast
              // toast.error("Session expired") - need to import toast if we want
            }, timeUntilExpire);
            return timer;
          }
        } catch (error) {
          // Invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
      return null;
    };

    const timer = checkTokenExpiration();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigate]);


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


