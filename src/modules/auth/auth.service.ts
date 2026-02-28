import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse, UserPayload } from '../../shared/types/auth.interface';
import { UserDomainService } from '../../domain/user/user-domain.service';
import { JwtPayload } from 'jsonwebtoken';
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

    return this.login({
      id: user.id,
      email: user.email,
    });
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
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
