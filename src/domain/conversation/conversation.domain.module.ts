import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';
import { ConversationDomainService } from './conversation-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, ConversationParticipant])],
  providers: [ConversationDomainService],
  exports: [ConversationDomainService],
})
export class ConversationDomainModule {}
