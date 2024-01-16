import {
  Body,
  Controller,
  FileTypeValidator,
  Headers,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdatePasswordDto, UpdateUserDto } from './dto';
import { AuthGuard } from 'src/guards';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Patch('update-password')
  updatePassword(
    @Headers('Authorization') authToken: string,
    @Body() dto: UpdatePasswordDto,
  ): Promise<boolean> {
    return this.userService.updatePassword(authToken, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('update-user')
  @UseInterceptors(FileInterceptor('avatar'))
  updateUser(
    @Headers('Authorization') authToken: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'jpg|jpeg|png' })],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<boolean> {
    return this.userService.updateUser(authToken, dto, avatar);
  }
}
