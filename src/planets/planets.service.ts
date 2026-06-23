import axios from 'axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { EXOPLANET_IMAGES, urls } from './planets.images';

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
      // Evita dejar el catch vacío para saber si falla la API o Redis
      console.error(`Error al obtener el planeta ${name}:`, e.message);
      throw new HttpException(
        'No se pudo procesar la solicitud del cuerpo celeste',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getExoplanetData(name: string) {
    // 1. Normalizamos y corregimos las abreviaciones astronómicas de la NASA
    let cleanedName = name.trim().toLowerCase();

    // Diccionario de parches para los nombres más comunes que la NASA abrevia
    cleanedName = cleanedName
      .replace('centauri', 'cen')
      .replace('cancri', 'cnc')
      .replace('eridani', 'eri')
      .replace('piscis austrini', 'psa');

    const cacheKey = `Exoplanet:${cleanedName}`;

    try {
      // 2. Intentar obtener desde el caché de Redis
      const cachedPlanet = await this.redis.get(cacheKey);
      if (cachedPlanet) {
        return JSON.parse(cachedPlanet);
      }

      // 3. CAMBIO CLAVE: Consultamos la tabla 'pscompx' en lugar de 'ps'
      // Esta tabla garantiza un solo resultado con los datos más completos posibles
      const query = `select * from pscompx where lower(pl_name)='${cleanedName}'`;
      const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`;

      const response = await axios.get(url);

      // 4. Validar si la NASA encontró el exoplaneta
      if (!response.data || response.data.length === 0) {
        return null;
      }

      // Al usar pscompx, la primera fila siempre es la mejor y la única oficial
      const rawPlanetData = response.data[0];

      // 5. Estructurar la respuesta
      const planetData = {
        name: rawPlanetData.pl_name,
        starName: rawPlanetData.hostname,
        discoveryYear: rawPlanetData.disc_year,
        discoveryMethod: rawPlanetData.discoverymethod,
        massEarths: rawPlanetData.pl_masse,
        radiusEarths: rawPlanetData.pl_rade,
        raw: rawPlanetData,
        imageUrl: this.getGenericExoplanetImage(rawPlanetData.pl_rade),
      };

      // 6. Guardar en el caché por 24 horas
      await this.redis.set(cacheKey, JSON.stringify(planetData), 86400);

      return planetData;
    } catch (e) {
      console.error(`Error al obtener el exoplaneta ${name}:`, e);
      throw e;
    }
  }

  private getGenericExoplanetImage(
    radiusEarths: number | undefined | null,
  ): string {
    // Si la NASA no tiene el dato, usamos la por defecto de tu archivo
    if (!radiusEarths) return EXOPLANET_IMAGES.default;

    // Clasificación basada en el radio utilizando tu constante externa
    if (radiusEarths < 1.25) {
      return EXOPLANET_IMAGES.rocky;
    } else if (radiusEarths < 2.0) {
      return EXOPLANET_IMAGES.superEarth;
    } else if (radiusEarths < 6.0) {
      return EXOPLANET_IMAGES.neptunian;
    } else {
      return EXOPLANET_IMAGES.gasGiant;
    }
  }
}
