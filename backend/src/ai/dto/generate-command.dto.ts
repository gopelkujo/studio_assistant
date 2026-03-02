import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class GenerateCommandDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsIn([
    'narrative',
    'asset-brief',
    'dialogue',
    'vibe-check',
    'bug-triager',
    'quest-logic',
    'summarize-email',
  ])
  type: string;
}
