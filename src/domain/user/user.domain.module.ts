import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserDomainService } from './user-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserDomainService],
  exports: [UserDomainService],
})
export class UserDomainModule {}
