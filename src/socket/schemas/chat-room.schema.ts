import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({
    required: true,
    type: [String],
  })
  users: [string];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
