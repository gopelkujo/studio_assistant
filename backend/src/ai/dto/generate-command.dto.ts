import {
  IsString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  /** Sampling temperature 0.0–2.0. Defaults to 0.7 if omitted. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  /** Maximum tokens in the response. Defaults to 1500 if omitted. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(256)
  @Max(4096)
  maxTokens?: number;
}
