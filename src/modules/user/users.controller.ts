import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../../shared/dto/auth/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUser } from '../../shared/decorators/get-current-user.decorator';
import type { UserPayload } from '../../shared/types/auth.interface';
import { UserDomainService } from '../../domain/user/user-domain.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../shared/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserDomainService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  @ApiBearerAuth()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getProfile(@GetCurrentUser() user: UserPayload) {
    return user;
  }
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
