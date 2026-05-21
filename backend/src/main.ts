import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que el frontend (Next.js en :3000) pueda comunicarse
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Habilitar validación global de DTOs con logs detallados
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(err => ({
        field: err.property,
        errors: Object.values(err.constraints || {}),
      }));
      console.log('❌ Error de Validación:', JSON.stringify(messages, null, 2));
      return new BadRequestException(messages);
    },
  }));

  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Backend corriendo en http://localhost:3001');
}
bootstrap();
