import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Role } from '../enums/role.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatar?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: Role.User })
  roles: [Role];
}

export const UserSchema = SchemaFactory.createForClass(User);
