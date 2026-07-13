import { apiClient } from './api-client';
import type { User, UserRole } from '@/types/user';

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
};