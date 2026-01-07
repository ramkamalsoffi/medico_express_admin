import { useMutation } from '@tanstack/react-query';
import { forgotPasswordApi } from '../services/forgotPasswordApi';
import { authApi } from '../services/authApi';

/**
 * Hook for sending OTP to email
 */
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordApi.sendOTP(email),
  });
};

/**
 * Hook for verifying OTP
 */
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      forgotPasswordApi.verifyOTP(email, otp),
  });
};

/**
 * Hook for resetting password with OTP
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      forgotPasswordApi.resetPassword(email, otp, newPassword),
  });
};

/**
 * Hook for changing password (logged-in users)
 */
export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword({ currentPassword, newPassword }),
  });
};
