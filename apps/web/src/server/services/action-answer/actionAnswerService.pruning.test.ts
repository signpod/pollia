import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { ActionType } from "@prisma/client";
import { ActionAnswerService } from "./index";

describe("ActionAnswerService - Pruning", () => {
  let service: ActionAnswerService;
  let mockAnswerRepo: jest.Mocked<ActionAnswerRepository>;
  let mockResponseRepo: jest.Mocked<MissionResponseRepository>;
  let mockActionRepo: jest.Mocked<ActionRepository>;
  let mockTx: any;

  beforeEach(() => {
    mockAnswerRepo = {
      findById: jest.fn(),
      collectInvalidAnswersByOptions: jest.fn(),
    } as unknown as jest.Mocked<ActionAnswerRepository>;

    mockResponseRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MissionResponseRepository>;

    mockActionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    mockTx = {
      actionAnswer: {
        deleteMany: jest.fn(),
        update: jest.fn(),
      },
    };

    global.prisma = {
      $transaction: jest.fn(async callback => callback(mockTx)),
    } as any;

    service = new ActionAnswerService(mockAnswerRepo, mockResponseRepo, mockActionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateAnswerWithPruning", () => {
    it("단일 경로 삭제: Q1(opt1->Q2) 변경 시 Q2 답변 삭제", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1", nextActionId: "action-2", nextCompletionId: null }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.collectInvalidAnswersByOptions.mockResolvedValue(["answer-2"]);

      mockTx.actionAnswer.update.mockResolvedValue({
        ...mockAnswer,
        options: [{ id: "opt-2" }],
        action: mockAnswer.action,
        fileUploads: [],
      });

      // When
      await service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-2"] }, "user-1");

      // Then
      expect(mockAnswerRepo.collectInvalidAnswersByOptions).toHaveBeenCalledWith(
        "response-1",
        ["opt-1"],
        mockTx,
      );
      expect(mockTx.actionAnswer.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["answer-2"] } },
      });
      expect(mockTx.actionAnswer.update).toHaveBeenCalled();
    });

    it("다중 분기 삭제: opt1->Q2, opt2->Q3 구조에서 모두 삭제", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [
          { id: "opt-1", nextActionId: "action-2", nextCompletionId: null },
          { id: "opt-2", nextActionId: "action-3", nextCompletionId: null },
        ],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.collectInvalidAnswersByOptions.mockResolvedValue(["answer-2", "answer-3"]);

      mockTx.actionAnswer.update.mockResolvedValue({
        ...mockAnswer,
        options: [{ id: "opt-4" }],
        action: mockAnswer.action,
        fileUploads: [],
      });

      // When
      await service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-4"] }, "user-1");

      // Then
      expect(mockAnswerRepo.collectInvalidAnswersByOptions).toHaveBeenCalledWith(
        "response-1",
        ["opt-1", "opt-2"],
        mockTx,
      );
      expect(mockTx.actionAnswer.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["answer-2", "answer-3"] } },
      });
    });

    it("깊은 경로 삭제: Q1->Q2->Q3->Q4 모두 삭제", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1", nextActionId: "action-2", nextCompletionId: null }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.collectInvalidAnswersByOptions.mockResolvedValue([
        "answer-2",
        "answer-3",
        "answer-4",
      ]);

      mockTx.actionAnswer.update.mockResolvedValue({
        ...mockAnswer,
        options: [{ id: "opt-x" }],
        action: mockAnswer.action,
        fileUploads: [],
      });

      // When
      await service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-x"] }, "user-1");

      // Then
      expect(mockTx.actionAnswer.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["answer-2", "answer-3", "answer-4"] } },
      });
    });

    it("순환 참조 방지: Q1->Q2->Q1 구조에서 무한 루프 없음", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1", nextActionId: "action-2", nextCompletionId: null }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.collectInvalidAnswersByOptions.mockResolvedValue(["answer-2"]);

      mockTx.actionAnswer.update.mockResolvedValue({
        ...mockAnswer,
        options: [{ id: "opt-x" }],
        action: mockAnswer.action,
        fileUploads: [],
      });

      // When
      await service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-x"] }, "user-1");

      // Then
      expect(mockTx.actionAnswer.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["answer-2"] } },
      });
    });

    it("Completion 도달 시 브랜치 종료", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1", nextActionId: "action-2", nextCompletionId: null }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.collectInvalidAnswersByOptions.mockResolvedValue(["answer-2"]);

      mockTx.actionAnswer.update.mockResolvedValue({
        ...mockAnswer,
        options: [{ id: "opt-x" }],
        action: mockAnswer.action,
        fileUploads: [],
      });

      // When
      await service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-x"] }, "user-1");

      // Then
      expect(mockTx.actionAnswer.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["answer-2"] } },
      });
    });

    it("답변 없는 경로: nextActionId 있지만 답변 없으면 종료", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1", nextActionId: "action-2", nextCompletionId: null }],
        action: { id: "action-1", type: ActionType.MULTIPLE_CHOICE, isRequired: true },
      };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);
      mockActionRepo.findById.mockResolvedValue(mockAnswer.action as any);
      mockAnswerRepo.collectInvalidAnswersByOptions.mockResolvedValue([]);

      mockTx.actionAnswer.update.mockResolvedValue({
        ...mockAnswer,
        options: [{ id: "opt-x" }],
        action: mockAnswer.action,
        fileUploads: [],
      });

      // When
      await service.updateAnswerWithPruning("answer-1", { selectedOptionIds: ["opt-x"] }, "user-1");

      // Then
      expect(mockTx.actionAnswer.deleteMany).not.toHaveBeenCalled();
      expect(mockTx.actionAnswer.update).toHaveBeenCalled();
    });
  });
});
