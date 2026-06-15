import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades del objeto que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza un error si envían propiedades no permitidas
      transform: true, // Transforma los tipos automáticamente (ej. string a number)
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
