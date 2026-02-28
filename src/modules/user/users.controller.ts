import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../../shared/dto/auth/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUser } from '../../shared/decorators/get-current-user.decorator';
import type { UserPayload } from '../../shared/types/auth.interface';
import { UserDomainService } from '../../domain/user/user-domain.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserDomainService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetCurrentUser() user: UserPayload) {
    return user;
  }
}
