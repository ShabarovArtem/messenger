import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  LoginResponse,
  UserPayload,
  JwtPayload,
} from '../../shared/types/auth.interface';
import { UserDomainService } from '../../domain/user/user-domain.service';
import { classToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserDomainService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: RegisterDto): Promise<LoginResponse> {
    const existUser = await this.usersService.findByEmail(dto.email);
    if (existUser) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const fullUser = await this.usersService.findById(user.id);

    return this.login(fullUser as UserPayload);
  }

  async validateUser(email: string, pass: string): Promise<UserPayload> {
    const dbUser = await this.usersService.findByEmail(email);
    if (!dbUser || !(await bcrypt.compare(pass, dbUser.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const plainUser = classToPlain(dbUser) as UserPayload;
    return plainUser;
  }

  async login(user: JwtPayload | UserPayload): Promise<LoginResponse> {
    const payload = { email: user.email, sub: user.id };
    const response: LoginResponse = {
      access_token: this.jwtService.sign(payload),
    };

    if ('name' in user) {
      response.user = {
        id: user.id,
        email: user.email,
        name: (user as UserPayload).name,
      };
    }

    return response;
  }
}
