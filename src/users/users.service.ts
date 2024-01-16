import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';

import { User } from './schemas/user.schema';
import { UpdatePasswordDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async updatePassword(
    authToken: string,
    dto: UpdatePasswordDto,
  ): Promise<boolean> {
    if (!(dto.newPassword === dto.passwordConfirmation))
      throw new HttpException('The passwords do not match', 403);
    const token = authToken.split(' ')[1];
    const { sub } = await this.jwtService.verify(token, {
      secret: this.config.get('JWT_AUTH_SECRET'),
    });

    const user = await this.userModel.findById(sub);
    if (!(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException();

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(
      sub,
      { $set: { password: hashedPassword } },
      { new: true },
    );

    return true;
  }

  async updateUser(
    authToken: string,
    dto: UpdateUserDto,
    avatar: Express.Multer.File,
  ): Promise<boolean> {
    const token = authToken.split(' ')[1];
    const { sub } = await this.jwtService.verify(token, {
      secret: this.config.get('JWT_AUTH_SECRET'),
    });

    if (avatar) {
      const fileName = `${Date.now()}${path.extname(avatar.originalname)}`;
      const filePath = `${__dirname}/../../uploads/${fileName}`;
      const user = await this.userModel.findByIdAndUpdate(sub, {
        $set: { avatar: '' },
      });
      fs.rmSync(`${__dirname}/../../uploads/${user.avatar}`);
      fs.writeFileSync(filePath, avatar.buffer);
      user.avatar = fileName;
      await user.save();
    }

    try {
      await this.userModel.findByIdAndUpdate(sub, { $set: dto }, { new: true });
    } catch (error: any) {
      if (error.code === 11000)
        throw new HttpException('The email address allready taken', 403);
      throw new HttpException(error.message, 500);
    }

    return true;
  }
}
