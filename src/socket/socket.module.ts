import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { SocketGateway } from './socket.gateway';
import { Chat, ChatRoom, ChatRoomSchema, ChatSchema } from './schemas';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ChatRoom.name,
        schema: ChatRoomSchema,
      },
      {
        name: Chat.name,
        schema: ChatSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [SocketGateway, JwtService],
})
export class SocketModule {}
