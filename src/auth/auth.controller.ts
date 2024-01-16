import {
  Body,
  Controller,
  FileTypeValidator,
  Headers,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { AuthService } from './auth.service';
import {
  SignInDto,
  SignUpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { AuthGuard, RefreshGuard, ResetPasswordGuard } from 'src/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('avatar'))
  signUp(
    @Body() dto: SignUpDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'jpg|jpeg|png' })],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<{ user: object; accessToken: string; refreshToken: string }> {
    return this.authService.signUp(dto, avatar);
  }

  @Post('sign-in')
  signIn(
    @Body() dto: SignInDto,
  ): Promise<{ user: object; accessToken: string; refreshToken: string }> {
    return this.authService.signIn(dto);
  }

  @UseGuards(AuthGuard)
  @UseGuards(RefreshGuard)
  @Post('refresh-token')
  refreshToken(@Headers() req: Request): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(req);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<boolean> {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(ResetPasswordGuard)
  @Patch('reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<boolean> {
    return this.authService.resetPassword(token, dto);
  }
}
