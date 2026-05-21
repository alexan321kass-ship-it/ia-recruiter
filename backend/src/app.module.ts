import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CvsModule } from './modules/cvs/cvs.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { PersonalityModule } from './modules/personality/personality.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    JobsModule, 
    CvsModule, 
    AiModule, 
    AnalysisModule,
    MailModule,
    InterviewsModule,
    PersonalityModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
