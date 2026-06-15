import { Controller, Get, Param } from '@nestjs/common';
import { PlanetsService } from './planets.service';

@Controller('planets')
export class PlanetsController {
  constructor(private readonly planetsService: PlanetsService) {}

  @Get(':name')
  getPlanet(@Param('name') name: string) {
    return this.planetsService.getPlanetData(name);
  }
}
