import { IsNotEmpty } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class JoinDto {
  @IsObjectId()
  @IsNotEmpty()
  userId: Types.ObjectId;
}
