import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import { AuthGuard } from '@nestjs/passport';
import type { UserPayload } from '../../shared/types/auth.interface';
import { GetCurrentUser } from '../../shared/decorators/get-current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@GetCurrentUser() user: UserPayload) {
    return this.authService.login(user);
  }
}
