import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserDomainModule } from '../../domain/user/user.domain.module';

@Module({
  imports: [UserDomainModule],
  controllers: [UsersController],
})
export class UsersModule {}
