import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class GenerateCommandDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsIn(['narrative', 'asset-brief'])
  type: 'narrative' | 'asset-brief';
}
