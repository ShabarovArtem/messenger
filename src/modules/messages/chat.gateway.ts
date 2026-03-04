import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConversationDomainService } from '../../domain/conversation/conversation-domain.service';
import type { JwtPayload } from '../../shared/types/auth.interface';
import { JoinConversationDto } from '../../shared/dto/messages/join-conversation.dto';

type AuthedSocket = Socket & {
  data: Socket['data'] & {
    user?: JwtPayload;
  };
};

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly conversationsService: ConversationDomainService,
  ) {}

  async handleConnection(client: AuthedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;
    } catch {
      client.disconnect();
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    const { token } = client.handshake.query;
    if (typeof token === 'string') {
      return token;
    }

    return null;
  }

  @SubscribeMessage('joinConversation')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  async handleJoinConversation(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: JoinConversationDto,
  ): Promise<void> {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return;
    }

    await this.conversationsService.ensureUserInConversation(
      data.conversationId,
      user.id,
    );

    client.join(data.conversationId);
  }

  emitMessage(message: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
  }) {
    this.server.to(message.conversationId).emit('message', message);
  }
}
