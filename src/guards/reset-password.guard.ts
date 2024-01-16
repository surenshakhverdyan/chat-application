import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.params.token;

    if (!token) throw new UnauthorizedException();

    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_FORGOT_PASSWORD_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
