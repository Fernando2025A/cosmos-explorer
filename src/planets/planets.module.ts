import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlanetsService } from './planets.service';
import { PlanetsController } from './planets.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [PlanetsController],
  providers: [PlanetsService, PrismaService],
})
export class PlanetsModule {}
