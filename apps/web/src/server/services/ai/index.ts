import {
  type AiStructuredOutput,
  aiStructuredOutputSchema,
  runAiPromptInputSchema,
} from "@/schemas/ai";
import { parseSchema } from "@/server/services/common/parseSchema";
import { type AiProvider, type AiUsage, anthropicAiProvider } from "./anthropicClient";

interface AiInputSegment {
  type: "text";
  text: string;
}

interface NormalizedAiInput {
  segments: AiInputSegment[];
}

export interface GenerateFromPromptResult {
  result: string;
  usage?: AiUsage;
}

const JSON_ONLY_SYSTEM_PROMPT = [
  "너는 JSON 응답만 반환하는 AI 도우미다.",
  '반드시 {"result":"string"} 형태의 JSON 객체 하나만 반환한다.',
  "JSON 외 텍스트, 코드블록, 설명은 절대 포함하지 않는다.",
].join(" ");

export class AiService {
  constructor(private provider: AiProvider = anthropicAiProvider) {}

  async generateFromPrompt(prompt: string): Promise<GenerateFromPromptResult> {
    try {
      const { prompt: validatedPrompt } = parseSchema(runAiPromptInputSchema, { prompt });
      const normalized = this.normalizeInput(validatedPrompt);

      const providerResponse = await this.provider.generateText({
        systemPrompt: JSON_ONLY_SYSTEM_PROMPT,
        userPrompt: this.buildUserPrompt(normalized),
      });

      const parsed = this.parseStructuredOutput(providerResponse.text);

      return {
        result: parsed.result,
        usage: providerResponse.usage,
      };
    } catch (error) {
      if (error instanceof Error && (error.cause === 400 || error.cause === 502)) {
        throw error;
      }

      const serverError = new Error("AI 요청 처리 중 오류가 발생했습니다.");
      serverError.cause = 500;
      throw serverError;
    }
  }

  private normalizeInput(prompt: string): NormalizedAiInput {
    return {
      segments: [
        {
          type: "text",
          text: prompt.trim(),
        },
      ],
    };
  }

  private buildUserPrompt(input: NormalizedAiInput): string {
    return input.segments.map(segment => segment.text).join("\n\n");
  }

  private parseStructuredOutput(rawText: string): AiStructuredOutput {
    const normalizedText = this.stripCodeFence(rawText);
    const parsedJson = this.parseJson(normalizedText);
    const parsed = aiStructuredOutputSchema.safeParse(parsedJson);

    if (!parsed.success) {
      const responseError = new Error("AI 응답 형식이 올바르지 않습니다.");
      responseError.cause = 502;
      throw responseError;
    }

    return parsed.data;
  }

  private stripCodeFence(rawText: string): string {
    const trimmed = rawText.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fenced?.[1]?.trim() || trimmed;
  }

  private parseJson(rawText: string): unknown {
    try {
      return JSON.parse(rawText);
    } catch {
      const responseError = new Error("AI 응답 형식이 올바르지 않습니다.");
      responseError.cause = 502;
      throw responseError;
    }
  }
}

export const aiService = new AiService();
