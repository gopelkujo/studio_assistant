import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateCommandDto } from './dto/generate-command.dto';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || 'dummy-key',
    });
  }

  private getNarrativePrompt(): string {
    return `You are a Lead Narrative Designer for a AAA Game Studio. Your task is to generate compelling, immersive, and logically consistent branching dialogue, character lore, or quest descriptions.

Output Requirements:
1. Tone: Maintain the exact genre and tone requested by the user. Ensure character voices are distinct.
2. Structure: Use clean Markdown with headings (## ) for readability.
3. Branching Options: If generating dialogue or a scene, always conclude with at least 3 distinct Player Choices. Explain the brief thematic or emotional consequence of each choice.
4. Constraints: Avoid cliché tropes unless specified. Do not break character or use overly modern colloquialisms for fantasy/sci-fi settings.

Format:
## Context & Setup
[Brief setup or character insight]

## The Scene
[Dialogue or narrative prose]

## Player Choices
- **[Choice 1: Action]** -> *Consequence/Emotional Shift*
- **[Choice 2: Action]** -> *Consequence/Emotional Shift*
- **[Choice 3: Action]** -> *Consequence/Emotional Shift*`;
  }

  private getAssetBriefPrompt(): string {
    return `You are a highly experienced Lead Art Director at a Game Studio. Your goal is to translate high-level conceptual inputs into precise, highly-technical asset briefs for 3D modelers and concept artists.

Output Requirements:
1. Visual Description: Clearly breakdown the silhouette, form, scale, and defining visual features. Provide specific real-world references if applicable.
2. Technical Specs: Define realistic technical constraints. Give recommendations for Polycount budget (e.g., Low, Mid, High), Texture Resolution (e.g., 2K, 4K), and key Material Properties (e.g., PBR Albedo, Roughness, Metallic, Emissive).
3. Formatting: Use structured, bulleted lists. Be purely descriptive, professional, and technical; avoid subjective adjectives when describing form.

Format:
## Asset Brief: [Asset Name]
- **Category:** [Prop/Character/Environment]
- **Target Style:** [e.g., Stylized/Photorealistic/Cell-shaded]

### Visual Breakdown
- **Silhouette & Form:** ...
- **Primary Features:** ...
- **Visual References:** ...

### Technical Requirements
- **Materials / Textures:** ...
- **Poly Budget Estimate:** ...
- **Texture Needs:** ...`;
  }

  async generateStream(dto: GenerateCommandDto): Promise<Observable<any>> {
    try {
      const systemPrompt =
        dto.type === 'narrative'
          ? this.getNarrativePrompt()
          : this.getAssetBriefPrompt();

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.prompt },
        ],
        stream: true,
      });

      return new Observable((subscriber) => {
        (async () => {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                // Formatting payload per Server-Sent Events requirements in NestJS
                subscriber.next({ data: { chunk: content, done: false } });
              }
            }
            subscriber.next({ data: { chunk: '', done: true } });
            subscriber.complete();
          } catch (error) {
            subscriber.error(new InternalServerErrorException('AI API stream failed'));
          }
        })();
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to initiate AI response');
    }
  }
}
