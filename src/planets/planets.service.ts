import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlanetsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlanetData(name: string) {
    const response = await axios.get(
      `https://api.le-systeme-solaire.net/rest/bodies/${name}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SOLAR_SYSTEM_API_KEY}`,
        },
      },
    );
    return response.data;
  }
}
