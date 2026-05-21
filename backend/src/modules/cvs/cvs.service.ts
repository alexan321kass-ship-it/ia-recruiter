import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
const pdfParse = require('pdf-parse');
import * as fs from 'fs/promises';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CvsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async uploadCv(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      console.log('📄 Procesando PDF...');
      const pdfData = await pdfParse(file.buffer);
      console.log('✅ PDF parseado');
      const parsedText = pdfData.text;

      console.log('🤖 Llamando a IA...');
      const generalAnalysis = await this.aiService.analyzeGeneralCv(parsedText);
      console.log('✅ IA completada');

      await fs.mkdir('./uploads', { recursive: true });
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      const filePath = `./uploads/${fileName}`;
      await fs.writeFile(filePath, file.buffer);

      const cv = await this.prisma.cv.create({
        data: {
          userId,
          fileUrl: filePath,
          parsedText: parsedText,
          generalAnalysis: generalAnalysis || {},
        },
      });

      return cv;
    } catch (error) {
      console.error('❌ Error procesando CV:', error);
      throw new BadRequestException('Failed to process PDF file: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async findByUser(userId: string) {
    return this.prisma.cv.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.cv.findUnique({
      where: { id },
    });
  }

  async delete(userId: string, id: string) {
    const cv = await this.prisma.cv.findFirst({
      where: { id, userId },
    });

    if (!cv) {
      throw new BadRequestException('CV not found or not owned by user');
    }

    // Optional: delete file from disk
    try {
      await fs.unlink(cv.fileUrl);
    } catch (err) {
      console.warn('Could not delete file from disk:', cv.fileUrl);
    }

    // Delete related analyses first (or use cascade if configured in DB)
    await this.prisma.analysis.deleteMany({
      where: { cvId: id },
    });

    return this.prisma.cv.delete({
      where: { id },
    });
  }
}
