import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { ActionType } from "@prisma/client";
import { ActionAnswerService } from ".";

describe("ActionAnswerService", () => {
  let service: ActionAnswerService;
  let mockAnswerRepo: jest.Mocked<ActionAnswerRepository>;
  let mockResponseRepo: jest.Mocked<MissionResponseRepository>;
  let mockActionRepo: jest.Mocked<ActionRepository>;

  const mockUser = { id: "user1" };
  const now = new Date();

  beforeEach(() => {
    mockAnswerRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByResponseId: jest.fn(),
      findByActionId: jest.fn(),
      findByResponseAndAction: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByResponseId: jest.fn(),
      deleteByResponseAndActions: jest.fn(),
    } as unknown as jest.Mocked<ActionAnswerRepository>;

    mockResponseRepo = {
      findById: jest.fn(),
      findByMissionAndUser: jest.fn(),
      findByMissionId: jest.fn(),
      findByUserId: jest.fn(),
      findCompletedByMissionId: jest.fn(),
      create: jest.fn(),
      updateCompletedAt: jest.fn(),
      delete: jest.fn(),
      deleteByMissionAndUser: jest.fn(),
      countByMissionId: jest.fn(),
      countCompletedByMissionId: jest.fn(),
    } as unknown as jest.Mocked<MissionResponseRepository>;

    mockActionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    service = new ActionAnswerService(mockAnswerRepo, mockResponseRepo, mockActionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnswerById", () => {
    it("Answer를 성공적으로 조회한다", async () => {
      // Given
      const mockAnswer = {
        id: "answer1",
        responseId: "response1",
        actionId: "action1",
        optionId: "option1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: now,
        response: { id: "response1", userId: "user1", missionId: "mission1" },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as never);

      // When
      const result = await service.getAnswerById("answer1", mockUser.id);

      // Then
      expect(result).toEqual(mockAnswer);
      expect(mockAnswerRepo.findById).toHaveBeenCalledWith("answer1");
    });

    it("Answer가 없으면 404 에러를 던진다", async () => {
      // Given
      mockAnswerRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getAnswerById("invalid-id", mockUser.id)).rejects.toThrow(
        "답변을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 Answer 조회 시 403 에러를 던진다", async () => {
      // Given
      const mockAnswer = {
        id: "answer1",
        response: { id: "response1", userId: "other-user", missionId: "mission1" },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as never);

      // When & Then
      await expect(service.getAnswerById("answer1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getAnswersByUserId", () => {
    it("사용자의 모든 Answer를 조회한다", async () => {
      // Given
      const mockAnswers = [{ id: "answer1" }, { id: "answer2" }];
      mockAnswerRepo.findByUserId.mockResolvedValue(mockAnswers as never);

      // When
      const result = await service.getAnswersByUserId(mockUser.id);

      // Then
      expect(result).toEqual(mockAnswers);
      expect(mockAnswerRepo.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("getAnswersByResponseId", () => {
    it("Response의 모든 Answer를 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", missionId: "mission1" };
      const mockAnswers = [{ id: "answer1" }, { id: "answer2" }];
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockAnswerRepo.findByResponseId.mockResolvedValue(mockAnswers as never);

      // When
      const result = await service.getAnswersByResponseId("response1", mockUser.id);

      // Then
      expect(result).toEqual(mockAnswers);
      expect(mockAnswerRepo.findByResponseId).toHaveBeenCalledWith("response1");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getAnswersByResponseId("invalid-id", mockUser.id)).rejects.toThrow(
        "응답을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 Response 조회 시 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(service.getAnswersByResponseId("response1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("createAnswer", () => {
    it("객관식 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", missionId: "mission1" };
      const mockAction = {
        id: "action1",
        missionId: "mission1",
        type: ActionType.MULTIPLE_CHOICE,
      };
      const mockCreatedAnswer = {
        id: "answer1",
        responseId: "response1",
        actionId: "action1",
        optionId: "option1",
      };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);
      mockAnswerRepo.create.mockResolvedValue(mockCreatedAnswer as never);

      // When
      const result = await service.createAnswer(
        { responseId: "response1", questionId: "action1", optionId: "option1" },
        mockUser.id,
      );

      // Then
      expect(result).toEqual(mockCreatedAnswer);
      expect(mockAnswerRepo.create).toHaveBeenCalled();
    });

    it("척도 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", missionId: "mission1" };
      const mockAction = { id: "action1", missionId: "mission1", type: ActionType.SCALE };
      const mockCreatedAnswer = { id: "answer1", scaleAnswer: 4 };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);
      mockAnswerRepo.create.mockResolvedValue(mockCreatedAnswer as never);

      // When
      const result = await service.createAnswer(
        { responseId: "response1", questionId: "action1", scaleAnswer: 4 },
        mockUser.id,
      );

      // Then
      expect(result).toEqual(mockCreatedAnswer);
    });

    it("주관식 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", missionId: "mission1" };
      const mockAction = {
        id: "action1",
        missionId: "mission1",
        type: ActionType.SUBJECTIVE,
      };
      const mockCreatedAnswer = { id: "answer1", textAnswer: "답변 내용" };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);
      mockAnswerRepo.create.mockResolvedValue(mockCreatedAnswer as never);

      // When
      const result = await service.createAnswer(
        { responseId: "response1", questionId: "action1", textAnswer: "답변 내용" },
        mockUser.id,
      );

      // Then
      expect(result).toEqual(mockCreatedAnswer);
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.createAnswer(
          { responseId: "response1", questionId: "invalid-action", optionId: "option1" },
          mockUser.id,
        ),
      ).rejects.toThrow("액션을 찾을 수 없습니다.");
    });

    it("객관식 액션에 optionId 없으면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      const mockAction = { id: "action1", type: ActionType.MULTIPLE_CHOICE };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);

      // When & Then
      await expect(
        service.createAnswer({ responseId: "response1", questionId: "action1" }, mockUser.id),
      ).rejects.toThrow("객관식 답변에는 선택지가 필요합니다.");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.createAnswer(
          { responseId: "invalid-response", questionId: "action1", optionId: "option1" },
          mockUser.id,
        ),
      ).rejects.toThrow("응답을 찾을 수 없습니다.");
    });
  });

  describe("submitAnswers", () => {
    it("여러 답변을 한번에 제출한다", async () => {
      // Given
      const mockResponse = {
        id: "response1",
        missionId: "mission1",
        userId: "user1",
        completedAt: null,
      };
      const mockActions = [
        { id: "q1", missionId: "mission1", type: ActionType.MULTIPLE_CHOICE },
        { id: "q2", missionId: "mission1", type: ActionType.SCALE },
      ];

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById
        .mockResolvedValueOnce(mockActions[0] as never)
        .mockResolvedValueOnce(mockActions[1] as never);
      mockAnswerRepo.deleteByResponseAndActions.mockResolvedValue({ count: 0 });
      mockAnswerRepo.createMany.mockResolvedValue({ count: 3 });

      // When
      const result = await service.submitAnswers(
        {
          responseId: "response1",
          answers: [
            {
              questionId: "q1",
              type: ActionType.MULTIPLE_CHOICE,
              selectedOptionIds: ["opt1", "opt2"],
            },
            { questionId: "q2", type: ActionType.SCALE, scaleValue: 4 },
          ],
        },
        mockUser.id,
      );

      // Then
      expect(result.responseId).toBe("response1");
      expect(result.answersCount).toBe(2);
      expect(mockAnswerRepo.createMany).toHaveBeenCalled();
    });

    it("이미 완료된 응답에 제출하면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", completedAt: now };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            responseId: "response1",
            answers: [{ questionId: "q1", type: ActionType.SCALE, scaleValue: 3 }],
          },
          mockUser.id,
        ),
      ).rejects.toThrow("이미 완료된 응답입니다.");
    });

    it("다른 Mission의 액션이 포함되면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = {
        id: "response1",
        missionId: "mission1",
        userId: "user1",
        completedAt: null,
      };
      const mockAction = { id: "q1", missionId: "other-mission", type: ActionType.SCALE };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            responseId: "response1",
            answers: [{ questionId: "q1", type: ActionType.SCALE, scaleValue: 3 }],
          },
          mockUser.id,
        ),
      ).rejects.toThrow("유효하지 않은 액션이 포함되어 있습니다.");
    });

    it("답변 타입이 액션 타입과 다르면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = {
        id: "response1",
        missionId: "mission1",
        userId: "user1",
        completedAt: null,
      };
      const mockAction = { id: "q1", missionId: "mission1", type: ActionType.SCALE };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            responseId: "response1",
            answers: [
              {
                questionId: "q1",
                type: ActionType.MULTIPLE_CHOICE,
                selectedOptionIds: ["opt1"],
              },
            ],
          },
          mockUser.id,
        ),
      ).rejects.toThrow("답변 타입이 액션 타입과 일치하지 않습니다.");
    });
  });

  describe("updateAnswer", () => {
    it("Answer를 성공적으로 수정한다", async () => {
      // Given
      const mockAnswer = {
        id: "answer1",
        actionId: "action1",
        optionId: "option1",
        response: { userId: "user1" },
      };
      const mockAction = { id: "action1", type: ActionType.MULTIPLE_CHOICE };
      const mockUpdatedAnswer = { ...mockAnswer, optionId: "option2" };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as never);
      mockActionRepo.findById.mockResolvedValue(mockAction as never);
      mockAnswerRepo.update.mockResolvedValue(mockUpdatedAnswer as never);

      // When
      const result = await service.updateAnswer("answer1", { optionId: "option2" }, mockUser.id);

      // Then
      expect(result.optionId).toBe("option2");
      expect(mockAnswerRepo.update).toHaveBeenCalledWith("answer1", { optionId: "option2" });
    });
  });

  describe("deleteAnswer", () => {
    it("Answer를 성공적으로 삭제한다", async () => {
      // Given
      const mockAnswer = { id: "answer1", response: { userId: "user1" } };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as never);
      mockAnswerRepo.delete.mockResolvedValue(mockAnswer as never);

      // When
      await service.deleteAnswer("answer1", mockUser.id);

      // Then
      expect(mockAnswerRepo.delete).toHaveBeenCalledWith("answer1");
    });
  });

  describe("deleteAnswersByResponseId", () => {
    it("Response의 모든 Answer를 삭제한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockAnswerRepo.deleteByResponseId.mockResolvedValue({ count: 5 });

      // When
      await service.deleteAnswersByResponseId("response1", mockUser.id);

      // Then
      expect(mockAnswerRepo.deleteByResponseId).toHaveBeenCalledWith("response1");
    });

    it("다른 사용자의 Response 삭제 시 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(service.deleteAnswersByResponseId("response1", mockUser.id)).rejects.toThrow(
        "권한이 없습니다.",
      );
    });
  });
});
