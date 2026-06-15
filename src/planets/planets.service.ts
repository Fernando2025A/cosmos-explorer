import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlanetsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getPlanetData(name: string) {
    const response = await firstValueFrom(
      this.httpService.get(`https://api.nasa.gov/planets/${name}`),
    );
    return response.data;
  }
}
