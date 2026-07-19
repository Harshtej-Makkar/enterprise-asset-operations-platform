import { apiClient } from './api-client';
import type { User, UserPreferences, UserRole } from '@/types/user';

interface ListUsersParams {
  role?: UserRole;
}

interface UsersResponse {
  data: User[];
  total: number;
}

export const userService = {
  async list(params?: ListUsersParams): Promise<UsersResponse> {
    const { data } = await apiClient.get<UsersResponse>('/users', { params });
    return data;
  },

  async updateProfile(payload: { fullName: string }): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/me', payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const { data } = await apiClient.patch<{ message: string }>('/users/me/password', payload);
    return data;
  },

  async updatePreferences(payload: UserPreferences): Promise<{ preferences: UserPreferences }> {
    const { data } = await apiClient.patch<{ preferences: UserPreferences }>('/users/me/preferences', payload);
    return data;
  },
};
