import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../shared/dto/auth/create-user.dto';

@Injectable()
export class UserDomainService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...safeUser
    } = savedUser;
    return safeUser as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: [
        'id',
        'email',
        'password',
        'name',
        'isEnabled',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isEnabled: true },
      select: [
        'id',
        'email',
        'name',
        'role',
        'isEnabled',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isEnabled: true },
      select: [
        'id',
        'email',
        'name',
        'role',
        'isEnabled',
        'createdAt',
        'updatedAt',
        'refreshToken',
      ],
    });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
  }
}
