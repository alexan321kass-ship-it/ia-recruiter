import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async scheduleInterview(analysisId: string, scheduledAt: Date, location: string, notes?: string) {
    // 1. Obtener datos del análisis, candidato y vacante para el correo
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        cv: {
          include: {
            user: true, // Datos del candidato
          },
        },
        job: true, // Datos de la vacante
      },
    });

    if (!analysis) {
      throw new BadRequestException('Análisis no encontrado');
    }

    // 2. Crear la entrevista en la DB
    const interview = await this.prisma.interview.create({
      data: {
        analysisId,
        scheduledAt,
        location,
        notes,
        status: 'PENDING',
      },
    });

    // 3. Enviar correo automático
    const dateFormatted = new Date(scheduledAt).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.mailService.sendInterviewInvitation(
      analysis.cv.user.email,
      analysis.cv.user.name,
      analysis.job.title,
      dateFormatted,
      location,
      notes || ''
    );

    return interview;
  }

  async getCandidateInterviews(userId: string) {
    return this.prisma.interview.findMany({
      where: {
        analysis: {
          cv: {
            userId: userId,
          },
        },
      },
      include: {
        analysis: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async getCompanyInterviews(companyId: string) {
    return this.prisma.interview.findMany({
      where: {
        analysis: {
          job: {
            companyId: companyId,
          },
        },
      },
      include: {
        analysis: {
          include: {
            cv: {
              include: {
                user: true,
              },
            },
            job: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async deleteInterview(interviewId: string, userId: string, role: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        analysis: {
          include: {
            cv: true,
            job: true,
          }
        }
      }
    });

    if (!interview) {
      throw new BadRequestException('Entrevista no encontrada');
    }

    if (role === 'COMPANY' && interview.analysis.job.companyId !== userId) {
      throw new BadRequestException('No tienes permiso para eliminar esta entrevista');
    }

    if (role === 'CANDIDATE' && interview.analysis.cv.userId !== userId) {
      throw new BadRequestException('No tienes permiso para eliminar esta entrevista');
    }

    return this.prisma.interview.delete({
      where: { id: interviewId }
    });
  }
}
