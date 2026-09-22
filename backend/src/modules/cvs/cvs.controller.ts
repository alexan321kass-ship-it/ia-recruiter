import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Get, Param, Delete, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import { CvsService } from './cvs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    console.log('📬 Petición de subida recibida para usuario:', user.userId);
    if (!file) console.log('⚠️ Archivo no detectado por Multer');
    return this.cvsService.uploadCv(user.userId, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @Get('my-cvs')
  async getMyCvs(@CurrentUser() user: any) {
    return this.cvsService.findByUser(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY, Role.CANDIDATE)
  @Get('download/:id')
  async downloadCv(@Param('id') id: string, @Res() res: Response) {
    const cv = await this.cvsService.findById(id);
    if (!cv) throw new NotFoundException('CV not found');

    // fileUrl is stored as a relative path like './uploads/filename.pdf'
    const filePath = path.resolve(cv.fileUrl);
    return res.sendFile(filePath);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @Post(':id/delete') // Use Post for better compatibility or Delete
  async deleteCv(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cvsService.delete(user.userId, id);
  }
}
