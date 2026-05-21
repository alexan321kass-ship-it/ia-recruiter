import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MailService } from '../modules/mail/mail.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const mailService = appContext.get(MailService);

  // Replace with a real email address for testing
  const testEmail = 'example@example.com';
  await mailService.sendInterviewInvitation(
    testEmail,
    'Candidato Prueba',
    'Ingeniero de Software',
    '2024-12-01 10:00 AM',
    'https://zoom.us/j/123456789',
    'Por favor confirma tu asistencia.',
  );

  console.log('📧 Email de prueba enviado a', testEmail);
  await appContext.close();
}

bootstrap().catch((err) => {
  console.error('❌ Error al enviar email de prueba:', err);
});
