import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { SocketGateway } from './socket.gateway';
import { Chat, ChatRoom, ChatRoomSchema, ChatSchema } from './schemas';

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
    ]),
  ],
  providers: [SocketGateway, JwtService],
})
export class SocketModule {}
