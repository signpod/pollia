import "server-only";

interface AnthropicClientConstructor {
  new (options: { apiKey: string }): AnthropicClientLike;
}

interface AnthropicClientLike {
  messages: {
    create(params: {
      model: string;
      max_tokens: number;
      system: string;
      messages: Array<{
        role: "user";
        content: string;
      }>;
    }): Promise<{
      content: unknown;
      usage?: unknown;
    }>;
  };
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiProviderGenerateRequest {
  systemPrompt: string;
  userPrompt: string;
}

export interface AiProviderGenerateResult {
  text: string;
  usage?: AiUsage;
}

export interface AiProvider {
  generateText(request: AiProviderGenerateRequest): Promise<AiProviderGenerateResult>;
}

const DEFAULT_MAX_TOKENS = 1024;

export class AnthropicAiProvider implements AiProvider {
  constructor(
    private client: AnthropicClientLike | null = null,
    private model: string | undefined = process.env.ANTHROPIC_MODEL,
    private maxTokens = DEFAULT_MAX_TOKENS,
  ) {}

  async generateText(request: AiProviderGenerateRequest): Promise<AiProviderGenerateResult> {
    const client = await this.getClient();
    const response = await client.messages.create({
      model: this.getModel(),
      max_tokens: this.maxTokens,
      system: request.systemPrompt,
      messages: [
        {
          role: "user",
          content: request.userPrompt,
        },
      ],
    });

    return {
      text: this.extractText(response.content),
      usage: this.normalizeUsage(response.usage),
    };
  }

  private async getClient(): Promise<AnthropicClientLike> {
    if (this.client) {
      return this.client;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const Anthropic = await this.getAnthropicConstructor();
    this.client = new Anthropic({ apiKey });
    return this.client;
  }

  private async getAnthropicConstructor(): Promise<AnthropicClientConstructor> {
    const sdkModuleName = "@anthropic-ai/sdk";
    let sdkModule: AnthropicClientConstructor | { default?: AnthropicClientConstructor };

    try {
      sdkModule = (await import(sdkModuleName)) as
        | AnthropicClientConstructor
        | { default?: AnthropicClientConstructor };
    } catch {
      throw new Error("@anthropic-ai/sdk 패키지를 불러오지 못했습니다. 의존성을 설치해주세요.");
    }

    if (typeof sdkModule === "function") {
      return sdkModule;
    }

    if (sdkModule.default && typeof sdkModule.default === "function") {
      return sdkModule.default;
    }

    throw new Error("@anthropic-ai/sdk 모듈을 불러오지 못했습니다.");
  }

  private getModel(): string {
    if (this.model) {
      return this.model;
    }

    const envModel = process.env.ANTHROPIC_MODEL;
    if (!envModel) {
      throw new Error("ANTHROPIC_MODEL 환경변수가 설정되지 않았습니다.");
    }

    this.model = envModel;
    return this.model;
  }

  private extractText(content: unknown): string {
    if (!Array.isArray(content)) {
      throw new Error("Anthropic 응답에서 content를 확인할 수 없습니다.");
    }

    const text = content
      .map(block => {
        if (!block || typeof block !== "object") {
          return null;
        }

        const type = Reflect.get(block, "type");
        if (type !== "text") {
          return null;
        }

        const value = Reflect.get(block, "text");
        return typeof value === "string" ? value : null;
      })
      .filter((value): value is string => typeof value === "string")
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Anthropic 응답에서 텍스트를 찾을 수 없습니다.");
    }

    return text;
  }

  private normalizeUsage(usage: unknown): AiUsage | undefined {
    if (!usage || typeof usage !== "object") {
      return undefined;
    }

    const inputTokens = this.pickNumberField(usage, ["input_tokens", "inputTokens"]) ?? 0;
    const outputTokens = this.pickNumberField(usage, ["output_tokens", "outputTokens"]) ?? 0;

    if (inputTokens === 0 && outputTokens === 0) {
      return undefined;
    }

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }

  private pickNumberField(target: object, fieldNames: string[]): number | undefined {
    for (const fieldName of fieldNames) {
      const value = Reflect.get(target, fieldName);
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }

    return undefined;
  }
}

export const anthropicAiProvider = new AnthropicAiProvider();
