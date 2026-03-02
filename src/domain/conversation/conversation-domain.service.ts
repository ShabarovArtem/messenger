import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';

@Injectable()
export class ConversationDomainService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
  ) {}

  async findOrCreatePrivateConversation(
    userId: string,
    otherUserId: string,
  ): Promise<Conversation> {
    const [userOneId, userTwoId] =
      userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

    let conversation = await this.conversationRepository.findOne({
      where: { isGroup: false, userOneId, userTwoId },
    });
    if (!conversation) {
      conversation = this.conversationRepository.create({
        isGroup: false,
        userOneId,
        userTwoId,
      });
      conversation = await this.conversationRepository.save(conversation);
    }
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const directConversations = await this.conversationRepository.find({
      where: [
        { isGroup: false, userOneId: userId },
        { isGroup: false, userTwoId: userId },
      ],
    });

    const participantRows = await this.participantRepository.find({
      where: { userId },
      select: ['conversationId'],
    });
    const groupConversationIds = participantRows.map((p) => p.conversationId);

    const groupConversations =
      groupConversationIds.length > 0
        ? await this.conversationRepository.find({
            where: { id: In(groupConversationIds), isGroup: true },
          })
        : [];

    const all = [...directConversations, ...groupConversations];
    return all.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async ensureUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new ForbiddenException('Access to this conversation is denied');
    }

    if (!conversation.isGroup) {
      if (
        conversation.userOneId !== userId &&
        conversation.userTwoId !== userId
      ) {
        throw new ForbiddenException('Access to this conversation is denied');
      }
      return conversation;
    }

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new ForbiddenException('Access to this conversation is denied');
    }
    return conversation;
  }

  async createGroupConversation(
    ownerId: string,
    name: string,
    memberIds: string[],
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        isGroup: true,
        name,
      }),
    );

    const uniqueMemberIds = Array.from(new Set([ownerId, ...memberIds]));
    const participants = uniqueMemberIds.map((userId) =>
      this.participantRepository.create({
        conversationId: conversation.id,
        userId,
        isAdmin: userId === ownerId,
      }),
    );
    await this.participantRepository.save(participants);

    return conversation;
  }

  async addUserToGroupConversation(
    conversationId: string,
    actingUserId: string,
    newUserId: string,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, isGroup: true },
    });
    if (!conversation) {
      throw new ForbiddenException('Conversation not found');
    }

    const actingParticipant = await this.participantRepository.findOne({
      where: { conversationId, userId: actingUserId },
    });
    if (!actingParticipant || !actingParticipant.isAdmin) {
      throw new ForbiddenException('Only admins can add members');
    }

    const existing = await this.participantRepository.findOne({
      where: { conversationId, userId: newUserId },
    });
    if (!existing) {
      await this.participantRepository.save(
        this.participantRepository.create({
          conversationId,
          userId: newUserId,
          isAdmin: false,
        }),
      );
    }
  }
}
