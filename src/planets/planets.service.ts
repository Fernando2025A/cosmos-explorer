import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { urls } from './planets.images';

@Injectable()
export class PlanetsService {
  constructor(
    private readonly prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getPlanetData(name: string) {
    const cacheKey = `Planet:${name.toLowerCase()}`;

    try {
      const cachedPlanet = await this.redis.get(cacheKey);

      if (cachedPlanet) {
        return JSON.parse(cachedPlanet);
      }

      const response = await axios.get(
        `https://api.le-systeme-solaire.net/rest/bodies/${name}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SOLAR_SYSTEM_API_KEY}`,
          },
        },
      );

      const planetName = response.data.englishName.toLowerCase();

      const planetData = {
        ...response.data,
        imageUrl:
          urls?.[planetName] ||
          urls?.['default'] ||
          'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800',
      };

      await this.redis.set(cacheKey, JSON.stringify(planetData), 86400);
      return planetData;
    } catch (e) {
      // 💡 MEJORA: Evita dejar el catch vacío para saber si falla la API o Redis
      console.error(`Error al obtener el planeta ${name}:`, e.message);
      throw new HttpException(
        'No se pudo procesar la solicitud del cuerpo celeste',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
