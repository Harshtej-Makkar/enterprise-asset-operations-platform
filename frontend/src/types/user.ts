/**
 * User & Role types.
 * Roles are an enum (not a separate table) per doc 08 §5.
 */
export type UserRole = 'admin' | 'plant_manager' | 'supervisor' | 'inspector' | 'technician';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  plantId: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Plant {
  id: string;
  name: string;
  city: string;
  address: string | null;
  status: 'active' | 'inactive';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  plant_manager: 'Plant Manager',
  supervisor: 'Supervisor',
  inspector: 'Inspector',
  technician: 'Maintenance Technician',
};
