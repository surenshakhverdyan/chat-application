import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SocketModule } from './socket/socket.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('DB_NAME'),
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: `smtps://${config.get<string>(
          'EMAIL_ADDRESS',
        )}:${config.get<string>('EMAIL_PASSWORD')}@${config.get<string>(
          'EMAIL_HOST',
        )}`,
      }),
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    SocketModule,
    PublicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
