import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { ActionType } from "@prisma/client";
import { ActionAnswerService } from "../index";

describe("ActionAnswerService - Pruning", () => {
  let service: ActionAnswerService;
  let mockAnswerRepo: jest.Mocked<ActionAnswerRepository>;
  let mockResponseRepo: jest.Mocked<MissionResponseRepository>;
  let mockActionRepo: jest.Mocked<ActionRepository>;

  beforeEach(() => {
    mockAnswerRepo = {
      findById: jest.fn(),
      updateWithPruning: jest.fn(),
    } as unknown as jest.Mocked<ActionAnswerRepository>;

    mockResponseRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MissionResponseRepository>;

    mockActionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    service = new ActionAnswerService(mockAnswerRepo, mockResponseRepo, mockActionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateAnswerWithPruning", () => {
    it("정상적으로 답변이 업데이트되어야 함", async () => {
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1" }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      const updatedAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        options: [{ id: "opt-2" }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
        fileUploads: [],
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.updateWithPruning.mockResolvedValue(updatedAnswer as any);

      const result = await service.updateAnswerWithPruning(
        "answer-1",
        { selectedOptionIds: ["opt-2"] },
        "user-1",
      );

      expect(result).toEqual(updatedAnswer);
      expect(result.options).toEqual([{ id: "opt-2" }]);
    });

    it("textAnswer 업데이트가 정상적으로 동작해야 함", async () => {
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [],
        action: { id: "action-1", type: ActionType.SHORT_TEXT, isRequired: true },
      };

      const updatedAnswer = {
        ...mockAnswer,
        textAnswer: "새로운 답변",
        fileUploads: [],
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.updateWithPruning.mockResolvedValue(updatedAnswer as any);

      const result = await service.updateAnswerWithPruning(
        "answer-1",
        { textAnswer: "새로운 답변" },
        "user-1",
      );

      expect(result.textAnswer).toBe("새로운 답변");
    });

    it("존재하지 않는 답변 ID로 요청 시 에러 발생", async () => {
      mockAnswerRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateAnswerWithPruning("invalid-id", { selectedOptionIds: ["opt-1"] }, "user-1"),
      ).rejects.toThrow("답변을 찾을 수 없습니다.");
    });

    it("다른 사용자의 답변 수정 시도 시 권한 에러 발생", async () => {
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-2", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1" }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);

      await expect(
        service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-2"] }, "user-1"),
      ).rejects.toThrow("조회 권한이 없습니다.");
    });

    it("필수 항목에 빈 값 입력 시 유효성 검사 에러 발생", async () => {
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1" }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);

      await expect(
        service.updateAnswerWithPruning("answer-1", { selectedOptionIds: [] }, "user-1"),
      ).rejects.toThrow();
    });

    it("SCALE 타입의 답변이 정상적으로 업데이트되어야 함", async () => {
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [],
        scaleAnswer: 3,
        action: { id: "action-1", type: ActionType.SCALE, isRequired: true },
      };

      const updatedAnswer = {
        ...mockAnswer,
        scaleAnswer: 5,
        fileUploads: [],
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.updateWithPruning.mockResolvedValue(updatedAnswer as any);

      const result = await service.updateAnswerWithPruning(
        "answer-1",
        { scaleAnswer: 5 },
        "user-1",
      );

      expect(result.scaleAnswer).toBe(5);
    });
  });
});
