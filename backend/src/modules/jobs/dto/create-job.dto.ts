import { IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsInt()
  @Min(0)
  experience: number;
}
