import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../../domain/conversation/entities/conversation.entity';
import { ConversationParticipant } from '../../domain/conversation/entities/conversation-participant.entity';
import { Message } from '../../domain/message/entities/message.entity';
import { ConversationDomainService } from '../../domain/conversation/conversation-domain.service';
import { MessageDomainService } from '../../domain/message/message-domain.service';
import { ConversationsController } from './conversations.controller';
import { MessagesController } from './messages.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationParticipant, Message]),
    AuthModule,
  ],
  controllers: [ConversationsController, MessagesController],
  providers: [ConversationDomainService, MessageDomainService, ChatGateway],
})
export class MessagesModule {}
