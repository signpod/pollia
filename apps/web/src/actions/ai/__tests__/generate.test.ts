const mockRequireAdmin = jest.fn();
jest.mock("@/actions/common/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

const mockGenerateFromPrompt = jest.fn();
jest.mock("@/server/services/ai", () => ({
  aiService: {
    generateFromPrompt: (...args: unknown[]) => mockGenerateFromPrompt(...args),
  },
}));

import { runAiPrompt } from "../generate";

describe("runAiPrompt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({
      supabaseUser: { id: "admin-user" },
      dbUser: { id: "admin-user", role: "ADMIN" },
    });
  });

  it("관리자 권한일 때 AI 결과를 반환한다", async () => {
    mockGenerateFromPrompt.mockResolvedValue({
      result: "테스트 응답",
      usage: {
        inputTokens: 10,
        outputTokens: 6,
        totalTokens: 16,
      },
    });

    const result = await runAiPrompt({ prompt: "hello" });

    expect(mockRequireAdmin).toHaveBeenCalledTimes(1);
    expect(mockGenerateFromPrompt).toHaveBeenCalledWith("hello");
    expect(result).toEqual({
      data: {
        result: "테스트 응답",
        usage: {
          inputTokens: 10,
          outputTokens: 6,
          totalTokens: 16,
        },
      },
    });
  });

  it("권한 에러(403)는 에러 객체로 반환한다", async () => {
    const authError = new Error("관리자 권한이 필요합니다.");
    authError.cause = 403;
    mockRequireAdmin.mockRejectedValue(authError);

    const result = await runAiPrompt({ prompt: "hello" });

    expect(result).toEqual({
      data: null,
      error: { message: "관리자 권한이 필요합니다.", cause: 403 },
    });
  });

  it("예상치 못한 서비스 에러는 500으로 래핑한다", async () => {
    mockGenerateFromPrompt.mockRejectedValue(new Error("unexpected"));

    await expect(runAiPrompt({ prompt: "hello" })).rejects.toMatchObject({
      message: "AI 응답 생성 중 오류가 발생했습니다.",
      cause: 500,
    });
  });
});
