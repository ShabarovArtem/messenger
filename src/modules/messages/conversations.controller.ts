import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationDomainService } from '../../domain/conversation/conversation-domain.service';
import { GetCurrentUser } from '../../shared/decorators/get-current-user.decorator';
import type { UserPayload } from '../../shared/types/auth.interface';
import { MessageDomainService } from '../../domain/message/message-domain.service';
import { GetMessagesQueryDto } from '../../shared/dto/messages/get-messages-query.dto';
import { CreateGroupConversationDto } from '../../shared/dto/messages/create-group-conversation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationDomainService,
    private readonly messageService: MessageDomainService,
  ) {}

  @Get()
  getMyConversations(@GetCurrentUser() user: UserPayload) {
    return this.conversationsService.getUserConversations(user.id);
  }

  @Post('group')
  createGroupConversation(
    @GetCurrentUser() user: UserPayload,
    @Body() dto: CreateGroupConversationDto,
  ) {
    return this.conversationsService.createGroupConversation(
      user.id,
      dto.name,
      dto.memberIds,
    );
  }

  @Get(':conversationId/messages')
  async getConversationMessages(
    @GetCurrentUser() user: UserPayload,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    const conversation =
      await this.conversationsService.ensureUserInConversation(
        conversationId,
        user.id,
      );
    return this.messageService.getMessagesForConversation(
      conversation.id,
      query.limit,
      query.offset,
    );
  }

  @Post(':conversationId/read')
  async markConversationMessagesAsRead(
    @GetCurrentUser() user: UserPayload,
    @Param('conversationId') conversationId: string,
  ) {
    const conversation =
      await this.conversationsService.ensureUserInConversation(
        conversationId,
        user.id,
      );

    await this.messageService.markMessagesAsReadForConversation(
      conversation.id,
      user.id,
    );

    return { success: true };
  }
}
