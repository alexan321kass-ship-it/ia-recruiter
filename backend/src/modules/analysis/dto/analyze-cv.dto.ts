import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeCvDto {
  @IsNotEmpty()
  @IsString()
  jobId: string;

  @IsNotEmpty()
  @IsString()
  cvId: string;
}
