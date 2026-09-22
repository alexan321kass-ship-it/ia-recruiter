import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Configuración de Swagger (Documentación de API)
  const config = new DocumentBuilder()
    .setTitle('IA Recruiter API')
    .setDescription('Documentación oficial del backend para IA Recruiter')
    .setVersion('1.0')
    .addBearerAuth() // Soporte para probar endpoints protegidos con JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Backend corriendo en http://localhost:3001');
}
bootstrap();
