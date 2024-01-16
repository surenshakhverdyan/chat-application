import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Chat, ChatRoom, ChatRoomSchema, ChatSchema } from 'src/socket/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ChatRoom.name,
        schema: ChatRoomSchema,
      },
      {
        name: Chat.name,
        schema: ChatSchema,
      },
    ]),
  ],
  providers: [AdminService, JwtService],
  controllers: [AdminController],
})
export class AdminModule {}
