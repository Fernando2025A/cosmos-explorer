import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades del objeto que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza un error si envían propiedades no permitidas
      transform: true, // Transforma los tipos automáticamente (ej. string a number)
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  await app.listen(process.env.PORT || 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
