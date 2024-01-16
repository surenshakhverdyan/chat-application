import { Body, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/schemas/user.schema';
import { ResetPasswordDto, SignInDto, SignUpDto } from './dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private resetPasswordTemplate: ResetPasswordTemplate,
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async signUp(
    dto: SignUpDto,
    avatar: Express.Multer.File,
  ): Promise<{ user: object; accessToken: string; refreshToken: string }> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });

      if (avatar) {
        const fileName = `${Date.now()}${path.extname(avatar.originalname)}`;
        const filePath = `${__dirname}/../../uploads/${fileName}`;
        fs.writeFileSync(filePath, avatar.buffer);
        user.avatar = fileName;
        await user.save();
      }

      const userObject = user.toObject();
      delete userObject.password;
      const payload = { sub: userObject._id, roles: userObject.roles };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.config.get('JWT_AUTH_SECRET'),
        expiresIn: '1d',
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      return { user: userObject, accessToken, refreshToken };
    } catch (error: any) {
      if (error.code === 11000)
        throw new HttpException('The email address allready taken', 403);
      throw new HttpException(error.message, 500);
    }
  }

  async signIn(
    dto: SignInDto,
  ): Promise<{ user: object; accessToken: string; refreshToken: string }> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new HttpException('User not found', 404);
    if (!(await bcrypt.compare(dto.password, user.password)))
      throw new HttpException('Wrong credentials', 403);

    const userObject = user.toObject();
    delete userObject.password;
    const payload = { sub: userObject._id, roles: userObject.roles };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_AUTH_SECRET'),
      expiresIn: '1d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { user: userObject, accessToken, refreshToken };
  }

  async refreshToken(req: Request): Promise<{ accessToken: string }> {
    const { sub, roles } = await this.jwtService.verify(req['refresh'], {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    const payload = { sub, roles };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_AUTH_SECRET'),
      expiresIn: '1d',
    });

    return { accessToken };
  }

  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<boolean> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new HttpException('User not found', 404);
    const payload = { sub: user._id };
    const resetPasswordToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_FORGOT_PASSWORD_SECRET'),
      expiresIn: '1h',
    });
    const resetPasswordLink = this.resetPasswordTemplate.getTemplate(
      `${this.config.get('BASE_URL')}/reset-password/${resetPasswordToken}`,
    );

    const email = await this.mailerService.sendMail({
      from: this.config.get('EMAIL_ADDRESS'),
      to: dto.email,
      subject: 'Reset password',
      html: resetPasswordLink,
    });

    if (!(email.response.split(' ')[0] === '250')) return false;
    return true;
  }

  async resetPassword(token: string, dto: ResetPasswordDto): Promise<boolean> {
    if (!(dto.password === dto.passwordConfirmation))
      throw new HttpException('The passwords do not match', 403);
    const { sub } = await this.jwtService.verify(token, {
      secret: this.config.get('JWT_FORGOT_PASSWORD_SECRET'),
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userModel.findByIdAndUpdate(
      sub,
      { $set: { password: hashedPassword } },
      { new: true },
    );

    return true;
  }
}
