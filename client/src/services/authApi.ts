import apiClient from '../lib/axios';
import type { LoginCredentials, LoginResponse, User, ChangePasswordPayload } from '../types';

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Login with username and password
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current logged-in user profile
   * GET /auth/me
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Change password for logged-in user
   * POST /auth/change-password
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', payload);
    return response.data;
  },

  /**
   * Logout (client-side token removal + optional server call)
   * POST /auth/logout
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },
};
