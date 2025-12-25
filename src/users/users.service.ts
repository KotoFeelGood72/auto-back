import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HistoryService } from '../history/history.service';
import { EntityType, ActionType } from '../history/dto/create-history.dto';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => HistoryService))
    private historyService: HistoryService,
  ) {}

  async create(createUserDto: CreateUserDto, userId?: number, userName?: string, request?: Request): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    const saved = await this.usersRepository.save(user);
    
    // Логируем создание
    if (userId) {
      try {
        await this.historyService.create(
          {
            entity_type: EntityType.USER,
            entity_id: saved.id,
            action: ActionType.CREATE,
            description: `Создан пользователь: ${saved.email}`,
          },
          userId,
          userName || '',
          request,
        );
      } catch (error) {
        console.error('Ошибка логирования создания пользователя:', error);
      }
    }
    
    return saved;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'role', 'phone', 'bio', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto, userId?: number, userName?: string, request?: Request): Promise<User> {
    const oldUser = await this.findOne(id);
    const oldData = { ...oldUser };
    delete oldData.password; // Не логируем пароли
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    Object.assign(oldUser, updateUserDto);
    const saved = await this.usersRepository.save(oldUser);
    
    // Определяем изменения
    if (userId) {
      try {
        const newData = { ...saved };
        delete newData.password;
        const changes = this.historyService.compareObjects(oldData, newData);
        await this.historyService.create(
          {
            entity_type: EntityType.USER,
            entity_id: saved.id,
            action: ActionType.UPDATE,
            changes: changes || undefined,
            description: `Обновлен пользователь: ${saved.email}`,
          },
          userId,
          userName || '',
          request,
        );
      } catch (error) {
        console.error('Ошибка логирования обновления пользователя:', error);
      }
    }
    
    return saved;
  }

  async remove(id: number, userId?: number, userName?: string, request?: Request): Promise<void> {
    const user = await this.findOne(id);
    const email = user.email;
    
    await this.usersRepository.remove(user);
    
    // Логируем удаление
    if (userId) {
      try {
        await this.historyService.create(
          {
            entity_type: EntityType.USER,
            entity_id: id,
            action: ActionType.DELETE,
            description: `Удален пользователь: ${email}`,
          },
          userId,
          userName || '',
          request,
        );
      } catch (error) {
        console.error('Ошибка логирования удаления пользователя:', error);
      }
    }
  }
}

