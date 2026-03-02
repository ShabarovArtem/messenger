import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationDomainService } from '../../domain/conversation/conversation-domain.service';
import { MessageDomainService } from '../../domain/message/message-domain.service';
import { GetCurrentUser } from '../../shared/decorators/get-current-user.decorator';
import type { UserPayload } from '../../shared/types/auth.interface';
import { CreateMessageDto } from '../../shared/dto/messages/create-message.dto';
import { ChatGateway } from './chat.gateway';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MessagesController {
  constructor(
    private readonly conversationsService: ConversationDomainService,
    private readonly messageService: MessageDomainService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  async sendMessage(
    @GetCurrentUser() user: UserPayload,
    @Body() dto: CreateMessageDto,
  ) {
    const conversation =
      await this.conversationsService.findOrCreatePrivateConversation(
        user.id,
        dto.recipientId,
      );
    const message = await this.messageService.createMessage(
      conversation.id,
      user.id,
      dto.content,
    );
    this.chatGateway.emitMessage(message);
    return message;
  }
}
