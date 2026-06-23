import { Controller, Get, Param } from '@nestjs/common';
import { PlanetsService } from './planets.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller()
export class PlanetsController {
  constructor(private readonly planetsService: PlanetsService) {}

  @Public()
  @Get('planets/:name')
  getPlanet(@Param('name') name: string) {
    return this.planetsService.getPlanetData(name);
  }

  @Public()
  @Get('exoplanets/:name')
  getExoplanet(@Param('name') name: string) {
    return this.planetsService.getExoplanetData(name);
  }

}
