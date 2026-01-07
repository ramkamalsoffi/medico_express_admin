import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/authApi';
import type { LoginCredentials, ChangePasswordPayload } from '../types';

/**
 * Query keys for auth-related queries
 */
export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store token and user in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
};

/**
 * Hook for fetching user profile
 * Only fetches if token exists
 */
export const useProfile = () => {
  const token = localStorage.getItem('token');

  return useQuery({
    queryKey: authKeys.profile,
    queryFn: authApi.getProfile,
    enabled: !!token, // Only fetch if logged in
    retry: false,
  });
};

/**
 * Hook for change password mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
  });
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  });
};
