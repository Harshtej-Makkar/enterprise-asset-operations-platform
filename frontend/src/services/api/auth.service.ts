import { apiClient } from './api-client';
import type { User } from '@/types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Auth service — calls the mock backend.
 *
 * The backend's POST /api/auth/login validates the seeded user credentials
 * (see database/seed/seed.sql) and returns a signed JWT plus the User
 * object. The frontend persists both in localStorage (simplification per
 * FSMOD §16 — production would use httpOnly cookies + refresh rotation).
 */
export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
