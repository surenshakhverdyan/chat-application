import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatRoom } from 'src/socket/schemas';

import { User } from 'src/users/schemas/user.schema';
import { DeleteChatDto, DeleteUserDto } from './dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
  ) {}

  async getUsers(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  async getConversations(): Promise<Chat[]> {
    const conversations = await this.chatModel
      .find()
      .populate('room', '_id')
      .populate('messages.user', 'name');
    return conversations;
  }

  async deleteUser(dto: DeleteUserDto): Promise<boolean> {
    await this.userModel.findByIdAndDelete(dto.userId);
    return true;
  }

  async deleteConversation(dto: DeleteChatDto): Promise<boolean> {
    const conversation = await this.chatModel.findByIdAndDelete(dto.chatId);
    await this.chatRoomModel.findByIdAndDelete(conversation.room);
    return true;
  }
}
