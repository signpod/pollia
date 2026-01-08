import type { ActionAnswerRepository } from "@/server/repositories/action-answer/actionAnswerRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import { ActionType } from "@prisma/client";
import { ActionAnswerService } from "./index";

describe("ActionAnswerService 테스트", () => {
  let service: ActionAnswerService;
  let mockAnswerRepo: jest.Mocked<ActionAnswerRepository>;
  let mockResponseRepo: jest.Mocked<MissionResponseRepository>;
  let mockActionRepo: jest.Mocked<ActionRepository>;

  beforeEach(() => {
    mockAnswerRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByResponseId: jest.fn(),
      findByActionId: jest.fn(),
      findByResponseAndAction: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      createManyWithRelations: jest.fn(),
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

  describe("getAnswerById", () => {
    it("자신의 답변을 조회할 수 있다", async () => {
      // Given
      const answerId = "answer-1";
      const userId = "user-1";
      const mockAnswer = {
        id: answerId,
        actionId: "action-1",
        responseId: "response-1",
        response: { userId: "user-1", id: "response-1", missionId: "mission-1" },
        options: [],
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);

      // When
      const result = await service.getAnswerById(answerId, userId);

      // Then
      expect(result).toEqual(mockAnswer);
      expect(mockAnswerRepo.findById).toHaveBeenCalledWith(answerId);
    });

    it("답변이 없으면 404 에러", async () => {
      // Given
      mockAnswerRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getAnswerById("answer-1", "user-1")).rejects.toThrow(
        "답변을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 답변을 조회하면 403 에러", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        response: { userId: "other-user", id: "response-1", missionId: "mission-1" },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as any);

      // When & Then
      await expect(service.getAnswerById("answer-1", "user-1")).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getAnswersByResponseId", () => {
    it("자신의 응답에 대한 답변들을 조회할 수 있다", async () => {
      // Given
      const responseId = "response-1";
      const userId = "user-1";
      const mockResponse = { id: responseId, userId, missionId: "mission-1" };
      const mockAnswers = [
        { id: "answer-1", actionId: "action-1", options: [] },
        { id: "answer-2", actionId: "action-2", options: [] },
      ];
      mockResponseRepo.findById.mockResolvedValue(mockResponse as any);
      mockAnswerRepo.findByResponseId.mockResolvedValue(mockAnswers as any);

      // When
      const result = await service.getAnswersByResponseId(responseId, userId);

      // Then
      expect(result).toEqual(mockAnswers);
      expect(mockResponseRepo.findById).toHaveBeenCalledWith(responseId);
      expect(mockAnswerRepo.findByResponseId).toHaveBeenCalledWith(responseId);
    });

    it("응답이 없으면 404 에러", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getAnswersByResponseId("response-1", "user-1")).rejects.toThrow(
        "응답을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 응답을 조회하면 403 에러", async () => {
      // Given
      const mockResponse = { id: "response-1", userId: "other-user", missionId: "mission-1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as any);

      // When & Then
      await expect(service.getAnswersByResponseId("response-1", "user-1")).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getAnswersByUserId", () => {
    it("사용자의 모든 답변을 조회할 수 있다", async () => {
      // Given
      const userId = "user-1";
      const mockAnswers = [
        { id: "answer-1", actionId: "action-1", options: [] },
        { id: "answer-2", actionId: "action-2", options: [] },
      ];
      mockAnswerRepo.findByUserId.mockResolvedValue(mockAnswers as any);

      // When
      const result = await service.getAnswersByUserId(userId);

      // Then
      expect(result).toEqual(mockAnswers);
      expect(mockAnswerRepo.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe("submitAnswers", () => {
    it("여러 답변을 제출할 수 있다", async () => {
      // Given
      const input = {
        responseId: "response-1",
        answers: [
          {
            actionId: "action-1",
            type: ActionType.MULTIPLE_CHOICE,
            isRequired: true,
            selectedOptionIds: ["opt-1", "opt-2"],
          },
          {
            actionId: "action-2",
            type: ActionType.SCALE,
            isRequired: true,
            scaleValue: 7,
          },
        ],
      };
      const userId = "user-1";

      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId,
        missionId: "mission-1",
        completedAt: null,
      } as any);

      mockActionRepo.findById.mockImplementation((id: string) =>
        Promise.resolve({
          id,
          type: id === "action-1" ? ActionType.MULTIPLE_CHOICE : ActionType.SCALE,
          isRequired: true,
          missionId: "mission-1",
        } as any),
      );

      (mockAnswerRepo.createManyWithRelations as jest.Mock).mockResolvedValue([
        { id: "answer-1" },
        { id: "answer-2" },
      ]);
      mockAnswerRepo.deleteByResponseAndActions.mockResolvedValue({ count: 0 } as any);

      // When
      const result = await service.submitAnswers(input, userId);

      // Then
      expect(result).toMatchObject({
        responseId: "response-1",
        answersCount: 2,
      });
      expect(mockAnswerRepo.deleteByResponseAndActions).toHaveBeenCalled();
      expect(mockAnswerRepo.createManyWithRelations).toHaveBeenCalledTimes(1);
    });

    it("트랜잭션으로 여러 답변을 원자적으로 생성한다", async () => {
      // Given
      const input = {
        responseId: "response-1",
        answers: [
          {
            actionId: "action-1",
            type: ActionType.MULTIPLE_CHOICE,
            isRequired: true,
            selectedOptionIds: ["opt-1", "opt-2"],
          },
          {
            actionId: "action-2",
            type: ActionType.SUBJECTIVE,
            isRequired: true,
            textAnswer: "주관식 답변",
          },
        ],
      };
      const userId = "user-1";

      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId,
        missionId: "mission-1",
        completedAt: null,
      } as any);

      mockActionRepo.findById.mockImplementation((id: string) =>
        Promise.resolve({
          id,
          type: id === "action-1" ? ActionType.MULTIPLE_CHOICE : ActionType.SUBJECTIVE,
          isRequired: true,
          missionId: "mission-1",
        } as any),
      );

      (mockAnswerRepo.createManyWithRelations as jest.Mock).mockResolvedValue([
        { id: "answer-1", actionId: "action-1" },
        { id: "answer-2", actionId: "action-2" },
      ]);
      mockAnswerRepo.deleteByResponseAndActions.mockResolvedValue({ count: 0 } as any);

      // When
      await service.submitAnswers(input, userId);

      // Then
      expect(mockAnswerRepo.createManyWithRelations).toHaveBeenCalledTimes(1);
      const callArgs = (mockAnswerRepo.createManyWithRelations as jest.Mock).mock.calls[0];
      const answersData = callArgs[0];
      const passedUserId = callArgs[1];

      expect(passedUserId).toBe(userId);
      expect(answersData).toHaveLength(2);
      expect(answersData[0]).toMatchObject({
        response: { connect: { id: "response-1" } },
        action: { connect: { id: "action-1" } },
        options: { connect: [{ id: "opt-1" }, { id: "opt-2" }] },
      });
      expect(answersData[1]).toMatchObject({
        response: { connect: { id: "response-1" } },
        action: { connect: { id: "action-2" } },
        textAnswer: "주관식 답변",
      });
    });

    it("답변 생성 중 에러 발생 시 모두 롤백된다", async () => {
      // Given
      const input = {
        responseId: "response-1",
        answers: [
          {
            actionId: "action-1",
            type: ActionType.MULTIPLE_CHOICE,
            isRequired: true,
            selectedOptionIds: ["opt-1"],
          },
          {
            actionId: "action-2",
            type: ActionType.SCALE,
            isRequired: true,
            scaleValue: 5,
          },
        ],
      };
      const userId = "user-1";

      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId,
        missionId: "mission-1",
        completedAt: null,
      } as any);

      mockActionRepo.findById.mockImplementation((id: string) =>
        Promise.resolve({
          id,
          type: id === "action-1" ? ActionType.MULTIPLE_CHOICE : ActionType.SCALE,
          isRequired: true,
          missionId: "mission-1",
        } as any),
      );

      mockAnswerRepo.deleteByResponseAndActions.mockResolvedValue({ count: 0 } as any);

      // 트랜잭션 실패 시뮬레이션
      (mockAnswerRepo.createManyWithRelations as jest.Mock).mockRejectedValue(
        new Error("Database constraint violation"),
      );

      // When & Then
      await expect(service.submitAnswers(input, userId)).rejects.toThrow(
        "Database constraint violation",
      );

      // 트랜잭션이 호출되었지만 에러로 인해 실패
      expect(mockAnswerRepo.createManyWithRelations).toHaveBeenCalledTimes(1);

      // 에러 발생 시 개별 create가 호출되지 않아야 함 (트랜잭션 내에서 모두 롤백)
      expect(mockAnswerRepo.create).not.toHaveBeenCalled();
    });

    it("이미 완료된 응답에는 제출할 수 없다", async () => {
      // Given
      const input = {
        responseId: "response-1",
        answers: [
          {
            actionId: "action-1",
            type: ActionType.SCALE,
            isRequired: true,
            scaleValue: 5,
          },
        ],
      };

      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId: "user-1",
        missionId: "mission-1",
        completedAt: new Date(),
      } as any);

      // When & Then
      await expect(service.submitAnswers(input, "user-1")).rejects.toThrow(
        "이미 완료된 응답입니다.",
      );
    });

    it("다른 사용자의 응답에 제출할 수 없다", async () => {
      // Given
      const input = {
        responseId: "response-1",
        answers: [
          {
            actionId: "action-1",
            type: ActionType.SCALE,
            isRequired: true,
            scaleValue: 5,
          },
        ],
      };

      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId: "other-user",
        missionId: "mission-1",
        completedAt: null,
      } as any);

      // When & Then
      await expect(service.submitAnswers(input, "user-1")).rejects.toThrow("권한이 없습니다.");
    });

    it("필수 답변이 비어있으면 에러", async () => {
      // Given
      const input = {
        responseId: "response-1",
        answers: [
          {
            actionId: "action-1",
            type: ActionType.MULTIPLE_CHOICE,
            isRequired: true, // 필수인데 답변 없음
          },
        ],
      };

      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId: "user-1",
        missionId: "mission-1",
        completedAt: null,
      } as any);

      mockActionRepo.findById.mockResolvedValue({
        id: "action-1",
        type: ActionType.MULTIPLE_CHOICE,
        isRequired: true,
        missionId: "mission-1",
        title: "필수 질문",
      } as any);

      // When & Then
      await expect(service.submitAnswers(input, "user-1")).rejects.toThrow("필수 답변이 누락");
    });
  });

  describe("updateAnswer", () => {
    it("자신의 답변을 수정할 수 있다", async () => {
      // Given
      const answerId = "answer-1";
      const userId = "user-1";
      const input = { textAnswer: "수정된 답변" };

      mockAnswerRepo.findById.mockResolvedValue({
        id: answerId,
        actionId: "action-1",
        responseId: "response-1",
        response: { userId, id: "response-1", missionId: "mission-1" },
      } as any);

      mockActionRepo.findById.mockResolvedValue({
        id: "action-1",
        type: ActionType.SUBJECTIVE,
        isRequired: true,
      } as any);

      mockAnswerRepo.update.mockResolvedValue({
        id: answerId,
        textAnswer: "수정된 답변",
      } as any);

      // When
      const result = await service.updateAnswer(answerId, input, userId);

      // Then
      expect(result.textAnswer).toBe("수정된 답변");
      expect(mockAnswerRepo.update).toHaveBeenCalledWith(answerId, input);
    });

    it("선택한 옵션을 수정할 수 있다 (M:N 관계)", async () => {
      // Given
      const answerId = "answer-1";
      const userId = "user-1";
      const input = { selectedOptionIds: ["opt-3", "opt-4"] };

      mockAnswerRepo.findById.mockResolvedValue({
        id: answerId,
        actionId: "action-1",
        responseId: "response-1",
        response: { userId, id: "response-1", missionId: "mission-1" },
        options: [{ id: "opt-1" }, { id: "opt-2" }], // 기존 옵션
      } as any);

      mockActionRepo.findById.mockResolvedValue({
        id: "action-1",
        type: ActionType.MULTIPLE_CHOICE,
        isRequired: true,
      } as any);

      mockAnswerRepo.update.mockResolvedValue({
        id: answerId,
        options: [{ id: "opt-3" }, { id: "opt-4" }],
      } as any);

      // When
      await service.updateAnswer(answerId, input, userId);

      // Then
      expect(mockAnswerRepo.update).toHaveBeenCalledWith(answerId, {
        options: {
          set: [{ id: "opt-3" }, { id: "opt-4" }],
        },
      });
    });

    it("다른 사용자의 답변을 수정할 수 없다", async () => {
      // Given
      mockAnswerRepo.findById.mockResolvedValue({
        id: "answer-1",
        response: { userId: "other-user", id: "response-1", missionId: "mission-1" },
      } as any);

      // When & Then
      await expect(
        service.updateAnswer("answer-1", { textAnswer: "수정" }, "user-1"),
      ).rejects.toThrow("조회 권한이 없습니다.");
    });
  });

  describe("deleteAnswer", () => {
    it("자신의 답변을 삭제할 수 있다", async () => {
      // Given
      const answerId = "answer-1";
      const userId = "user-1";

      mockAnswerRepo.findById.mockResolvedValue({
        id: answerId,
        response: { userId, id: "response-1", missionId: "mission-1" },
      } as any);

      mockAnswerRepo.delete.mockResolvedValue({ id: answerId } as any);

      // When
      await service.deleteAnswer(answerId, userId);

      // Then
      expect(mockAnswerRepo.delete).toHaveBeenCalledWith(answerId);
    });

    it("다른 사용자의 답변을 삭제할 수 없다", async () => {
      // Given
      mockAnswerRepo.findById.mockResolvedValue({
        id: "answer-1",
        response: { userId: "other-user", id: "response-1", missionId: "mission-1" },
      } as any);

      // When & Then
      await expect(service.deleteAnswer("answer-1", "user-1")).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("deleteAnswersByResponseId", () => {
    it("자신의 응답에 대한 모든 답변을 삭제할 수 있다", async () => {
      // Given
      const responseId = "response-1";
      const userId = "user-1";

      mockResponseRepo.findById.mockResolvedValue({
        id: responseId,
        userId,
        missionId: "mission-1",
      } as any);

      mockAnswerRepo.deleteByResponseId.mockResolvedValue({ count: 5 } as any);

      // When
      await service.deleteAnswersByResponseId(responseId, userId);

      // Then
      expect(mockAnswerRepo.deleteByResponseId).toHaveBeenCalledWith(responseId);
    });

    it("다른 사용자의 응답에 대한 답변을 삭제할 수 없다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue({
        id: "response-1",
        userId: "other-user",
        missionId: "mission-1",
      } as any);

      // When & Then
      await expect(service.deleteAnswersByResponseId("response-1", "user-1")).rejects.toThrow(
        "권한이 없습니다.",
      );
    });
  });

  describe("convertAnswerToCreateInput - private 메서드 (블랙박스)", () => {
    const responseId = "test-response-id";

    it("MULTIPLE_CHOICE: 여러 옵션 선택 시 1개 Answer에 여러 Option connect", () => {
      // Given
      const answer = {
        actionId: "action-1",
        type: ActionType.MULTIPLE_CHOICE,
        isRequired: true,
        selectedOptionIds: ["opt-1", "opt-2", "opt-3"],
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        response: { connect: { id: responseId } },
        action: { connect: { id: "action-1" } },
        options: {
          connect: [{ id: "opt-1" }, { id: "opt-2" }, { id: "opt-3" }],
        },
      });
    });

    it("MULTIPLE_CHOICE: 옵션 + 기타 의견 함께 입력", () => {
      // Given
      const answer = {
        actionId: "action-1",
        type: ActionType.MULTIPLE_CHOICE,
        isRequired: true,
        selectedOptionIds: ["opt-1"],
        textAnswer: "기타 의견",
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result[0]).toMatchObject({
        options: { connect: [{ id: "opt-1" }] },
        textAnswer: "기타 의견",
      });
    });

    it("TAG: 여러 태그 선택 시 1개 Answer에 연결", () => {
      // Given
      const answer = {
        actionId: "action-1",
        type: ActionType.TAG,
        isRequired: true,
        selectedOptionIds: ["tag-1", "tag-2"],
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].options.connect).toHaveLength(2);
    });

    it("SCALE: 척도 값 저장", () => {
      // Given
      const answer = {
        actionId: "action-1",
        type: ActionType.SCALE,
        isRequired: true,
        scaleValue: 7,
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result[0].scaleAnswer).toBe(7);
    });

    it("SUBJECTIVE: 주관식 답변 저장", () => {
      // Given
      const answer = {
        actionId: "action-1",
        type: ActionType.SUBJECTIVE,
        isRequired: true,
        textAnswer: "주관식 답변",
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result[0].textAnswer).toBe("주관식 답변");
    });

    it("IMAGE: 여러 파일 fileUploads.connect로 연결", () => {
      // Given
      const answer = {
        actionId: "action-1",
        type: ActionType.IMAGE,
        isRequired: true,
        fileUploadIds: ["file-1", "file-2"],
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result[0]).toMatchObject({
        fileUploads: {
          connect: [{ id: "file-1" }, { id: "file-2" }],
        },
      });
    });

    it("DATE: 날짜 배열 저장", () => {
      // Given
      const dates = ["2024-01-01", "2024-01-02"];
      const answer = {
        actionId: "action-1",
        type: ActionType.DATE,
        isRequired: true,
        dateAnswers: dates,
      };

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, responseId);

      // Then
      expect(result[0].dateAnswers).toEqual(dates);
    });

    it("모든 답변은 response와 action이 connect된다", () => {
      // Given
      const answer = {
        actionId: "action-123",
        type: ActionType.SCALE,
        isRequired: true,
        scaleValue: 5,
      };
      const testResponseId = "response-456";

      // When
      const result = (service as any).convertAnswerToCreateInput(answer, testResponseId);

      // Then
      expect(result[0]).toMatchObject({
        response: { connect: { id: "response-456" } },
        action: { connect: { id: "action-123" } },
      });
    });
  });
});
