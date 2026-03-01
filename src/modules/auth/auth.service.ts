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
import { ConfigService } from '@nestjs/config';
import type { User } from '../../domain/user/entities/user.entity';
import type { RefreshTokenDto } from '../../shared/dto/auth/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserDomainService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  private async getTokens(
    user: JwtPayload | UserPayload,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private buildLoginResponse(
    tokens: { access_token: string; refresh_token: string },
    user?: User | UserPayload,
  ): LoginResponse {
    const response: LoginResponse = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
    if (user && 'name' in user) {
      response.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }
    return response;
  }

  async login(user: JwtPayload | UserPayload): Promise<LoginResponse> {
    const tokens = await this.getTokens(user);
    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 12);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    return this.buildLoginResponse(tokens, user as UserPayload);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<LoginResponse> {
    const refreshToken = dto.refreshToken;
    try {
      const payload = (await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      })) as { sub: string; email: string };
      const user = await this.usersService.findByIdWithRefreshToken(
        payload.sub,
      );
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const refreshMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!refreshMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const tokens = await this.getTokens({
        id: user.id,
        email: user.email,
      });
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 12);
      await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
      return this.buildLoginResponse(tokens, user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
