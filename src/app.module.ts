import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PlanetsModule } from './planets/planets.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlanetsModule,
    PrismaModule,
    AuthModule,
    MailModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
