import { User } from '../../domain/user/entities/user.entity';

export interface LoginResponse {
  access_token: string;
  user?: Pick<UserPayload, 'id' | 'email' | 'name'>;
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface UserPayload extends JwtPayload {
  name: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type SafeUser = Omit<User, 'password' | 'refreshToken'>;
