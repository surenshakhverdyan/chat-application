import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({
    required: true,
    users: [{ user: { type: MongooseSchema.Types.ObjectId, ref: 'User' } }],
  })
  users: [{ user: Types.ObjectId }];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
