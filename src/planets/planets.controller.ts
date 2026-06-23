import { Controller, Get, Param } from '@nestjs/common';
import { PlanetsService } from './planets.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('planets')
export class PlanetsController {
  constructor(private readonly planetsService: PlanetsService) {}

  @Public()
  @Get(':name')
  getPlanet(@Param('name') name: string) {
    return this.planetsService.getPlanetData(name);
  }
}
