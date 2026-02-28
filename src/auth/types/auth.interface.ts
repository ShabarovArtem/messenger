import { User } from '../../users/entities/user.entity';

export interface LoginResponse {
  access_token: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, 'password' | 'refreshToken'>;
