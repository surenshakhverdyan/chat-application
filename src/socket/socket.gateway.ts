import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Model } from 'mongoose';

import { WsGuard } from 'src/guards';
import { Chat, ChatRoom } from './schemas';
import { JoinDto, MessageDto } from './dto';
import { User } from 'src/users/schemas/user.schema';

@UseGuards(WsGuard)
@UsePipes(new ValidationPipe())
@WebSocketGateway({ namespace: 'socket' })
export class SocketGateway {
  @WebSocketServer()
  private server: Server = new Server();

  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}

  handleConnection() {}
  handleDisconnect() {}

  @SubscribeMessage('join')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: JoinDto,
  ): Promise<Chat | void> {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const userId = this.extractSubFromToken(token);

    const room = await this.chatRoomModel.findOne({
      users: {
        $all: [userId, dto.userId],
      },
    });

    let roomId: string;
    if (!room) {
      const { _id } = await this.chatRoomModel.create({
        users: [userId, dto.userId],
      });
      roomId = _id.toString();
    } else {
      roomId = room._id.toString();
    }

    this.server.socketsJoin(roomId);

    const conversation = await this.chatModel
      .findOne({ room: roomId })
      .populate('messages.user', 'name')
      .exec();

    if (conversation) {
      return conversation;
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: MessageDto,
  ): Promise<void> {
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const userId = this.extractSubFromToken(token);
    const user = await this.userModel.findById(userId);
    const chat = await this.chatModel.findOne({ room: dto.room });

    if (!chat) {
      await this.chatModel.create({
        room: dto.room,
        messages: { user: user._id, message: dto.message },
      });
    } else {
      chat.messages.push({ user: user, message: dto.message });
      await chat.save();
    }

    const roomId = dto.room.toString();
    this.server.to(roomId).emit('message', dto.message);
  }

  private extractSubFromToken(token: string): string {
    const { sub } = this.jwtService.verify(token, {
      secret: this.config.get('JWT_AUTH_SECRET'),
    });

    return sub;
  }
}
