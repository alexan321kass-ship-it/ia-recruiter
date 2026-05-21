import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Roles(Role.COMPANY, Role.CANDIDATE)
  @Post()
  analyze(@Body() analyzeCvDto: AnalyzeCvDto, @CurrentUser() user: any) {
    return this.analysisService.analyze(analyzeCvDto, user.userId, user.role);
  }

  @Roles(Role.COMPANY)
  @Get('job/:jobId')
  getJobAnalyses(@Param('jobId') jobId: string, @CurrentUser() user: any) {
    return this.analysisService.getJobAnalyses(jobId, user.userId);
  }

  @Roles(Role.COMPANY)
  @Get('stats/company')
  getCompanyStats(@CurrentUser() user: any) {
    return this.analysisService.getCompanyDashboardStats(user.userId);
  }

  @Roles(Role.COMPANY)
  @Get('company/all')
  getAllAnalyses(@CurrentUser() user: any) {
    return this.analysisService.getAllCompanyAnalyses(user.userId);
  }

  @Roles(Role.CANDIDATE)
  @Get('my-applications')
  getMyApplications(@CurrentUser() user: any) {
    return this.analysisService.getCandidateApplications(user.userId);
  }

  @Roles(Role.CANDIDATE)
  @Post('practice/questions')
  getPracticeQuestions(@Body() body: { cvId: string; jobId?: string }, @CurrentUser() user: any) {
    return this.analysisService.getPracticeQuestions(body.cvId, body.jobId, user.userId);
  }

  @Roles(Role.CANDIDATE)
  @Post('practice/evaluate')
  evaluatePracticeAnswer(@Body() body: { cvId: string; question: string; answer: string }, @CurrentUser() user: any) {
    return this.analysisService.evaluatePracticeAnswer(body.cvId, body.question, body.answer, user.userId);
  }

  @Roles(Role.COMPANY)
  @Get('recruiter-questions/:analysisId')
  getCustomRecruiterQuestions(@Param('analysisId') analysisId: string, @CurrentUser() user: any) {
    return this.analysisService.getCustomRecruiterQuestions(analysisId, user.userId);
  }
}

