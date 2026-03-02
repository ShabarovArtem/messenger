import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageDomainService } from './message-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageDomainService],
  exports: [MessageDomainService],
})
export class MessageDomainModule {}
