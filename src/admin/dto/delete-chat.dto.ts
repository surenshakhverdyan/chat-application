import { IsNotEmpty } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class DeleteChatDto {
  @IsObjectId()
  @IsNotEmpty()
  chatId: Types.ObjectId;
}
