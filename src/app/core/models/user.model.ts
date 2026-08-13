export type UserRole = 'super_admin' | 'restaurant_admin';

export interface AdminUser {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string;
  role?: UserRole;
}
