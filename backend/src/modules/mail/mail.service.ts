import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'iarecruiter021@gmail.com',
        pass: process.env.EMAIL_PASS, // Requerirá App Password
      },
    });
  }

  async sendInterviewInvitation(candidateEmail: string, candidateName: string, jobTitle: string, date: string, location: string, notes: string) {
    const isUrl = location.startsWith('http://') || location.startsWith('https://');
    const locationLink = isUrl ? location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    const mailOptions = {
      from: `"IA Recruiter" <${process.env.EMAIL_USER || 'iarecruiter021@gmail.com'}>`,
      to: candidateEmail,
      subject: `Invitación a Entrevista: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #6366f1;">¡Hola, ${candidateName}!</h2>
          <p>Tenemos excelentes noticias. Tras analizar tu perfil con nuestra IA para la vacante de <strong>${jobTitle}</strong>, la empresa ha quedado impresionada y desea conocerte en una entrevista.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Fecha y Hora:</strong> ${date}</p>
            <p><strong>📍 Lugar/Enlace:</strong> <a href="${locationLink}" target="_blank">${location}</a></p>
            ${notes ? `<p><strong>📝 Notas adicionales:</strong> ${notes}</p>` : ''}
          </div>

          <p>Por favor, confirma tu asistencia respondiendo a este correo o a través de nuestra plataforma.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Impulsado por IA Recruiter - El futuro del talento.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Correo de invitación enviado a: ${candidateEmail}`);
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
      // No lanzamos error para no romper la transacción de la DB, 
      // pero se debería manejar mejor en producción.
    }
  }
}
