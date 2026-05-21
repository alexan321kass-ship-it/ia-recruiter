import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Post('schedule')
  async scheduleInterview(
    @Body() body: { analysisId: string; scheduledAt: string; location: string; notes?: string }
  ) {
    return this.interviewsService.scheduleInterview(
      body.analysisId,
      new Date(body.scheduledAt),
      body.location,
      body.notes
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @Get('my-interviews')
  async getMyInterviews(@CurrentUser() user: any) {
    return this.interviewsService.getCandidateInterviews(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Get('company-interviews')
  async getCompanyInterviews(@CurrentUser() user: any) {
    return this.interviewsService.getCompanyInterviews(user.userId);
  }
}
