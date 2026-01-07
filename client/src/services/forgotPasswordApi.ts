import apiClient from '../lib/axios';

/**
 * Forgot Password API Service
 */
export const forgotPasswordApi = {
  /**
   * Send OTP to email for password reset
   * POST /auth/forgot-password
   */
  sendOTP: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify OTP
   * POST /auth/verify-otp
   */
  verifyOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  /**
   * Reset password with OTP
   * POST /auth/reset-password
   */
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};
