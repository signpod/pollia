import { ActionType } from "@prisma/client";

const mockResolveMissionActor = jest.fn();
jest.mock("@/actions/common/auth", () => ({
  resolveMissionActor: () => mockResolveMissionActor(),
}));

const mockGetRequestMeta = jest.fn();
jest.mock("@/actions/common/requestMeta", () => ({
  getRequestMeta: () => mockGetRequestMeta(),
}));

const mockGetResponseById = jest.fn();
const mockCompleteResponse = jest.fn();
jest.mock("@/server/services/mission-response", () => ({
  missionResponseService: {
    getResponseById: (...args: unknown[]) => mockGetResponseById(...args),
    completeResponse: (...args: unknown[]) => mockCompleteResponse(...args),
  },
}));

const mockSubmitAnswers = jest.fn();
const mockUpdateAnswer = jest.fn();
const mockUpdateAnswerWithPruning = jest.fn();
jest.mock("@/server/services/action-answer", () => ({
  actionAnswerService: {
    submitAnswers: (...args: unknown[]) => mockSubmitAnswers(...args),
    updateAnswer: (...args: unknown[]) => mockUpdateAnswer(...args),
    updateAnswerWithPruning: (...args: unknown[]) => mockUpdateAnswerWithPruning(...args),
  },
}));

jest.mock("@/lib/answer/compareAnswers", () => ({
  isAnswerSameAsSubmitted: jest.fn().mockReturnValue(false),
}));

import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import { submitAnswerOnly } from "../submitAndNavigate";

const MISSION_ID = "mission-1";
const RESPONSE_ID = "response-1";
const ACTOR = { userId: "user-1", guestId: null };

function createTextAnswer(overrides: Record<string, unknown> = {}) {
  return {
    actionId: "action-1",
    type: ActionType.SHORT_TEXT,
    isRequired: true,
    textAnswer: "hello",
    ...overrides,
  } as const;
}

function createMockResponse(overrides = {}) {
  return {
    id: RESPONSE_ID,
    missionId: MISSION_ID,
    userId: "user-1",
    guestId: null,
    completedAt: null,
    answers: [],
    mission: { id: MISSION_ID },
    user: { id: "user-1" },
    ...overrides,
  };
}

describe("submitAnswerOnly", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveMissionActor.mockResolvedValue(ACTOR);
    mockGetRequestMeta.mockResolvedValue({ ipAddress: null, userAgent: null });
    mockGetResponseById.mockResolvedValue(createMockResponse());
    mockCompleteResponse.mockResolvedValue({});
    mockSubmitAnswers.mockResolvedValue({});
    mockUpdateAnswer.mockResolvedValue({});
    mockUpdateAnswerWithPruning.mockResolvedValue({});
    (isAnswerSameAsSubmitted as jest.Mock).mockReturnValue(false);
  });

  describe("입력 선검증", () => {
    it("responseId가 빈 문자열이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: "",
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({
        success: false,
        error: "유효하지 않은 응답입니다.",
        code: "VALIDATION_ERROR",
      });
      expect(mockGetResponseById).not.toHaveBeenCalled();
    });
  });

  describe("미션 정합성 검증", () => {
    it("response.missionId와 missionId가 다르면 VALIDATION_ERROR를 반환한다", async () => {
      mockGetResponseById.mockResolvedValue(createMockResponse({ missionId: "other-mission" }));

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({
        success: false,
        error: "유효하지 않은 응답입니다.",
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("완료 여부 검증", () => {
    it("response.completedAt이 있으면 ALREADY_COMPLETED를 반환한다", async () => {
      mockGetResponseById.mockResolvedValue(createMockResponse({ completedAt: new Date() }));

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({
        success: false,
        error: "이미 완료된 미션입니다.",
        code: "ALREADY_COMPLETED",
      });
    });
  });

  describe("답변 저장 분기", () => {
    it("기존 답변이 없으면 submitAnswers를 호출한다", async () => {
      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({ success: true });
      expect(mockSubmitAnswers).toHaveBeenCalledWith(
        {
          responseId: RESPONSE_ID,
          answers: [expect.objectContaining({ actionId: "action-1", type: ActionType.SHORT_TEXT })],
        },
        ACTOR,
      );
    });

    it("기존 답변이 있으면 updateAnswer를 호출한다", async () => {
      mockGetResponseById.mockResolvedValue(
        createMockResponse({
          answers: [{ id: "answer-1", actionId: "action-1", type: ActionType.SHORT_TEXT }],
        }),
      );

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({ success: true });
      expect(mockUpdateAnswer).toHaveBeenCalledWith("answer-1", { textAnswer: "hello" }, ACTOR);
      expect(mockSubmitAnswers).not.toHaveBeenCalled();
    });

    it("답변이 동일하면 저장하지 않는다", async () => {
      (isAnswerSameAsSubmitted as jest.Mock).mockReturnValue(true);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({ success: true });
      expect(mockSubmitAnswers).not.toHaveBeenCalled();
      expect(mockUpdateAnswer).not.toHaveBeenCalled();
    });
  });

  describe("완료 처리", () => {
    it("isLastAction이면 completeResponse를 동일 responseId로 호출한다", async () => {
      (isAnswerSameAsSubmitted as jest.Mock).mockReturnValue(true);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: true,
      });

      expect(result).toEqual({ success: true });
      expect(mockCompleteResponse).toHaveBeenCalledWith({ responseId: RESPONSE_ID }, ACTOR, {
        ipAddress: null,
        userAgent: null,
      });
    });

    it("nextCompletionId가 있으면 completeResponse를 호출한다", async () => {
      (isAnswerSameAsSubmitted as jest.Mock).mockReturnValue(true);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer({ nextCompletionId: "comp-1" }),
        isLastAction: false,
      });

      expect(result).toEqual({ success: true });
      expect(mockCompleteResponse).toHaveBeenCalledWith({ responseId: RESPONSE_ID }, ACTOR, {
        ipAddress: null,
        userAgent: null,
      });
    });

    it("isLastAction이 아니고 nextCompletionId도 없으면 completeResponse를 호출하지 않는다", async () => {
      (isAnswerSameAsSubmitted as jest.Mock).mockReturnValue(true);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({ success: true });
      expect(mockCompleteResponse).not.toHaveBeenCalled();
    });
  });

  describe("에러 매핑", () => {
    it("getResponseById가 404를 throw하면 VALIDATION_ERROR를 반환한다", async () => {
      const err = new Error("응답을 찾을 수 없습니다.");
      err.cause = 404;
      mockGetResponseById.mockRejectedValue(err);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({
        success: false,
        error: "응답을 찾을 수 없습니다.",
        code: "VALIDATION_ERROR",
      });
    });

    it("getResponseById가 403을 throw하면 VALIDATION_ERROR를 반환한다", async () => {
      const err = new Error("조회 권한이 없습니다.");
      err.cause = 403;
      mockGetResponseById.mockRejectedValue(err);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({
        success: false,
        error: "조회 권한이 없습니다.",
        code: "VALIDATION_ERROR",
      });
    });

    it("500 에러는 SERVER_ERROR를 반환한다", async () => {
      const err = new Error("서버 오류");
      err.cause = 500;
      mockGetResponseById.mockRejectedValue(err);

      const result = await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(result).toEqual({
        success: false,
        error: "서버 오류",
        code: "SERVER_ERROR",
      });
    });
  });

  describe("단일 소스 검증", () => {
    it("getResponseById를 responseId와 actor로 호출한다", async () => {
      (isAnswerSameAsSubmitted as jest.Mock).mockReturnValue(true);

      await submitAnswerOnly({
        missionId: MISSION_ID,
        responseId: RESPONSE_ID,
        answer: createTextAnswer(),
        isLastAction: false,
      });

      expect(mockGetResponseById).toHaveBeenCalledWith(RESPONSE_ID, ACTOR);
    });
  });
});
