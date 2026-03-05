import { AI_PROMPT_MAX_LENGTH } from "@/schemas/ai";
import { type AiProvider, AnthropicAiProvider } from "./anthropicClient";
import { AiService } from "./index";

function createMockProvider(): jest.Mocked<AiProvider> {
  return {
    generateText: jest.fn(),
  };
}

describe("AiService", () => {
  let service: AiService;
  let mockProvider: jest.Mocked<AiProvider>;

  beforeEach(() => {
    mockProvider = createMockProvider();
    service = new AiService(mockProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("유효한 prompt 입력 시 구조화된 결과를 반환한다", async () => {
    mockProvider.generateText.mockResolvedValue({
      text: '{"result":"요약 결과"}',
      usage: {
        inputTokens: 11,
        outputTokens: 7,
        totalTokens: 18,
      },
    });

    const result = await service.generateFromPrompt("테스트 요청");

    expect(result).toEqual({
      result: "요약 결과",
      usage: {
        inputTokens: 11,
        outputTokens: 7,
        totalTokens: 18,
      },
    });
    expect(mockProvider.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        userPrompt: "테스트 요청",
      }),
    );
  });

  it("빈 prompt 입력 시 400 에러를 던진다", async () => {
    await expect(service.generateFromPrompt("   ")).rejects.toMatchObject({
      cause: 400,
    });
  });

  it("길이 제한을 초과한 prompt 입력 시 400 에러를 던진다", async () => {
    const longPrompt = "a".repeat(AI_PROMPT_MAX_LENGTH + 1);

    await expect(service.generateFromPrompt(longPrompt)).rejects.toMatchObject({
      cause: 400,
    });
  });

  it("모델 응답이 JSON이 아니면 502 에러를 던진다", async () => {
    mockProvider.generateText.mockResolvedValue({
      text: "plain text response",
    });

    await expect(service.generateFromPrompt("테스트")).rejects.toMatchObject({
      cause: 502,
    });
  });

  it("모델 응답 JSON이 스키마와 다르면 502 에러를 던진다", async () => {
    mockProvider.generateText.mockResolvedValue({
      text: '{"summary":"invalid"}',
    });

    await expect(service.generateFromPrompt("테스트")).rejects.toMatchObject({
      cause: 502,
    });
  });

  it("외부 호출 실패는 500 에러로 래핑한다", async () => {
    mockProvider.generateText.mockRejectedValue(new Error("timeout"));

    await expect(service.generateFromPrompt("테스트")).rejects.toMatchObject({
      message: "AI 요청 처리 중 오류가 발생했습니다.",
      cause: 500,
    });
  });

  it("Anthropic 환경변수가 없으면 초기화 실패를 500으로 반환한다", async () => {
    const env = process.env as Record<string, string | undefined>;
    const originalApiKey = env.ANTHROPIC_API_KEY;
    const originalModel = env.ANTHROPIC_MODEL;

    env.ANTHROPIC_API_KEY = undefined;
    env.ANTHROPIC_MODEL = undefined;

    const anthropicService = new AiService(new AnthropicAiProvider(null, "claude-test-model"));

    await expect(anthropicService.generateFromPrompt("테스트")).rejects.toMatchObject({
      cause: 500,
    });

    if (originalApiKey) {
      env.ANTHROPIC_API_KEY = originalApiKey;
    } else {
      env.ANTHROPIC_API_KEY = undefined;
    }

    if (originalModel) {
      env.ANTHROPIC_MODEL = originalModel;
    } else {
      env.ANTHROPIC_MODEL = undefined;
    }
  });
});
