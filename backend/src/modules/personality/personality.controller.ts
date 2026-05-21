import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-test')
  async findMyTest(@CurrentUser() user: any) {
    return this.personalityService.findByUserId(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitTest(@Body() body: { answers: Record<string, number> }, @CurrentUser() user: any) {
    return this.personalityService.submit(user.userId, body.answers);
  }

  @UseGuards(JwtAuthGuard)
  @Get('candidate/:userId')
  async findCandidateTest(@Param('userId') userId: string) {
    return this.personalityService.findByUserId(userId);
  }
}
