import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async analyze(analyzeCvDto: AnalyzeCvDto, userId: string, role: string) {
    const { jobId, cvId } = analyzeCvDto;

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    if (role === 'COMPANY' && job.companyId !== userId) {
      throw new BadRequestException('You do not have permission to analyze CVs for this job');
    }

    const cv = await this.prisma.cv.findUnique({
      where: { id: cvId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (role === 'CANDIDATE' && cv.userId !== userId) {
      throw new BadRequestException('You can only apply using your own CV');
    }

    // Call OpenAI
    const aiResult = await this.aiService.evaluateCvAgainstJob(cv.parsedText, {
      title: job.title,
      description: job.description,
      skills: job.skills,
      experience: job.experience,
    });

    // Save Result
    const analysis = await this.prisma.analysis.create({
      data: {
        jobId,
        cvId,
        score: aiResult.score,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        recommendations: aiResult.recommendations,
      },
      include: {
        cv: {
            include: {
                user: { select: { name: true, email: true } }
            }
        }
      }
    });

    return analysis;
  }

  async getJobAnalyses(jobId: string, companyId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.companyId !== companyId) {
       throw new NotFoundException('Job not found or unauthorized');
    }

    return this.prisma.analysis.findMany({
      where: { jobId },
      orderBy: { score: 'desc' },
      include: {
        cv: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                personalityTest: true,
              },
            },
          },
        },
      },
    });
  }

  async getCompanyDashboardStats(companyId: string) {
    const jobsCount = await this.prisma.job.count({ where: { companyId } });
    const analysesCount = await this.prisma.analysis.count({
      where: { job: { companyId } },
    });
    // Count unique candidates by counting users who have at least one CV with an analysis for this company's jobs
    const uniqueCandidates = await this.prisma.user.count({
      where: {
        role: 'CANDIDATE',
        cvs: {
          some: {
            analyses: {
              some: {
                job: { companyId }
              }
            }
          }
        }
      }
    });

    return {
      jobsCount,
      analysesCount,
      uniqueCandidates,
    };
  }

  async getAllCompanyAnalyses(companyId: string) {
    return this.prisma.analysis.findMany({
      where: { job: { companyId } },
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { title: true } },
        cv: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                personalityTest: true,
              },
            },
          },
        },
      },
    });
  }

  async getCandidateApplications(candidateId: string) {
    return this.prisma.analysis.findMany({
      where: { cv: { userId: candidateId } },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: { company: { select: { name: true } } }
        }
      }
    });
  }

  async getPracticeQuestions(cvId: string, jobId?: string, candidateId?: string) {
    const cv = await this.prisma.cv.findUnique({
      where: { id: cvId },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (candidateId && cv.userId !== candidateId) {
      throw new BadRequestException('You do not have permission to use this CV');
    }

    let jobTitle: string | undefined = undefined;
    let jobDescription: string | undefined = undefined;

    if (jobId) {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
      });
      if (job) {
        jobTitle = job.title;
        jobDescription = job.description;
      }
    }

    return this.aiService.generatePracticeQuestions(cv.parsedText, jobTitle, jobDescription);
  }

  async evaluatePracticeAnswer(cvId: string, question: string, answer: string, candidateId?: string) {
    const cv = await this.prisma.cv.findUnique({
      where: { id: cvId },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (candidateId && cv.userId !== candidateId) {
      throw new BadRequestException('You do not have permission to use this CV');
    }

    return this.aiService.evaluatePracticeAnswer(question, answer, cv.parsedText);
  }

  async getCustomRecruiterQuestions(analysisId: string, companyId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        cv: true,
        job: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.job.companyId !== companyId) {
      throw new BadRequestException('You do not have permission to view questions for this candidate');
    }

    return this.aiService.generateRecruiterQuestions(
      analysis.cv.parsedText,
      analysis.job.title,
      analysis.job.description,
      analysis.score,
    );
  }
}

