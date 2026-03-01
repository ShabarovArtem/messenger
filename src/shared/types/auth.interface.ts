import { User } from '../../domain/user/entities/user.entity';
import { Role } from '../enums/role.enum';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user?: Pick<UserPayload, 'id' | 'email' | 'name'>;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface UserPayload extends JwtPayload {
  name: string;
  isEnabled: boolean;
  role?: Role;
  createdAt: Date;
  updatedAt: Date;
}
export type SafeUser = Omit<User, 'password' | 'refreshToken'>;
