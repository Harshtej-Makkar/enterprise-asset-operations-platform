export type UserRole = 'admin' | 'plant_manager' | 'supervisor' | 'inspector' | 'technician';

export interface UserPreferences {
  emailNotifications?: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  plantId: string | null;
  status: string;
  preferences?: UserPreferences;
}

export interface Plant {
  id: string;
  name: string;
  city: string;
  address: string | null;
  status: 'active' | 'inactive';
}
