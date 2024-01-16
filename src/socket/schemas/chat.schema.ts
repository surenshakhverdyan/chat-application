import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'ChatRoom',
  })
  room: Types.ObjectId;

  @Prop({
    required: true,
    messages: [
      {
        user: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'User',
          message: String,
        },
      },
    ],
  })
  messages: [
    {
      user: Types.ObjectId;
      message: string;
    },
  ];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
