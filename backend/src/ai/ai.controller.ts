import { Controller, Post, Body, Sse, MessageEvent, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateCommandDto } from './dto/generate-command.dto';
import { Observable } from 'rxjs';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @Sse()
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateStream(@Body() dto: GenerateCommandDto): Promise<Observable<MessageEvent>> {
    return this.aiService.generateStream(dto);
  }
}
