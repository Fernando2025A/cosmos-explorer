import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from 'src/mail/mail.service';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JWT_EXPIRES_IN, JWT_SECRET } from './auth.constants';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>(JWT_SECRET);
        if (!secret) {
          throw new Error(
            `${JWT_SECRET} is not defined in environment variables`,
          );
        }

        const expiresIn =
          (configService.get<string>(
            JWT_EXPIRES_IN,
          ) as jwt.SignOptions['expiresIn']) || '1h';

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, MailService],
  exports: [AuthService],
})
export class AuthModule {}
