import { Module } from '@nestjs/common';
import { PlanetsModule } from './planets/planets.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PlanetsModule, PrismaModule, AuthModule],
})
export class AppModule {}
