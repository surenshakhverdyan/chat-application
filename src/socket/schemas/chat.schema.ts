import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { User } from 'src/users/schemas/user.schema';

interface ChatMessage {
  user: MongooseSchema.Types.ObjectId | User;
  message: string;
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'ChatRoom',
  })
  room: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: [
      {
        user: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'User',
        },
        message: String,
      },
    ],
  })
  messages: Array<ChatMessage>;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
