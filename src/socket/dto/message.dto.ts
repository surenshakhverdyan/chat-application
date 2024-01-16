import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class MessageDto {
  @IsMongoId()
  @IsNotEmpty()
  room: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  message: string;
}
