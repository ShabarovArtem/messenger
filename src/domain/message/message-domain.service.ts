import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageDomainService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
    });
    return this.messageRepository.save(message);
  }

  async getMessagesForConversation(
    conversationId: string,
    limit = 50,
    offset = 0,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
  }
}
