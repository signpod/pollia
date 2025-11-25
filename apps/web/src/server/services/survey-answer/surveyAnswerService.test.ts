import type { SurveyAnswerRepository } from "@/server/repositories/survey-answer/surveyAnswerRepository";
import type { SurveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyQuestionType } from "@prisma/client";
import { SurveyAnswerService } from "./surveyAnswerService";

describe("SurveyAnswerService", () => {
  let service: SurveyAnswerService;
  let mockAnswerRepo: jest.Mocked<SurveyAnswerRepository>;
  let mockSurveyRepo: jest.Mocked<SurveyRepository>;
  let mockQuestionRepo: jest.Mocked<SurveyQuestionRepository>;

  beforeEach(() => {
    mockAnswerRepo = {
      findById: jest.fn(),
      findByQuestionAndUser: jest.fn(),
      findBySurveyAndUser: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByQuestionsAndUser: jest.fn(),
      deleteBySurveyAndUser: jest.fn(),
    } as unknown as jest.Mocked<SurveyAnswerRepository>;

    mockSurveyRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyRepository>;

    mockQuestionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyQuestionRepository>;

    service = new SurveyAnswerService(mockAnswerRepo, mockSurveyRepo, mockQuestionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnswerById", () => {
    it("Answer를 성공적으로 조회한다", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: new Date(),
        question: {
          id: "question-1",
          title: "질문",
          description: null,
          imageUrl: null,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: 1,
          maxSelections: 1,
          surveyId: "survey-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        option: {
          id: "option-1",
          title: "선택지",
          description: null,
          imageUrl: null,
          order: 1,
          questionId: "question-1",
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user: {
          id: "user-1",
          name: "사용자",
          email: "user@example.com",
        },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer);

      // When
      const result = await service.getAnswerById("answer-1");

      // Then
      expect(result).toEqual(mockAnswer);
      expect(mockAnswerRepo.findById).toHaveBeenCalledWith("answer-1");
    });

    it("Answer가 없으면 404 에러를 던진다", async () => {
      // Given
      mockAnswerRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getAnswerById("invalid-id")).rejects.toThrow("답변을 찾을 수 없습니다.");

      try {
        await service.getAnswerById("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });
  });

  describe("getAnswersByQuestionAndUser", () => {
    it("Question과 User로 Answer 목록을 조회한다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: 1,
        maxSelections: 1,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockAnswers = [
        {
          id: "answer-1",
          questionId: "question-1",
          userId: "user-1",
          optionId: "option-1",
          textAnswer: null,
          scaleAnswer: null,
          createdAt: new Date(),
          option: {
            id: "option-1",
            title: "선택지",
            description: null,
            imageUrl: null,
            order: 1,
            questionId: "question-1",
            fileUploadId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockAnswerRepo.findByQuestionAndUser.mockResolvedValue(mockAnswers);

      // When
      const result = await service.getAnswersByQuestionAndUser("question-1", "user-1");

      // Then
      expect(result).toEqual(mockAnswers);
      expect(mockQuestionRepo.findById).toHaveBeenCalledWith("question-1");
      expect(mockAnswerRepo.findByQuestionAndUser).toHaveBeenCalledWith("question-1", "user-1");
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getAnswersByQuestionAndUser("invalid-id", "user-1")).rejects.toThrow(
        "질문을 찾을 수 없습니다.",
      );

      try {
        await service.getAnswersByQuestionAndUser("invalid-id", "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });
  });

  describe("createAnswer", () => {
    it("객관식 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: 1,
        maxSelections: 1,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: new Date(),
        question: mockQuestion,
        option: {
          id: "option-1",
          title: "선택지",
          description: null,
          imageUrl: null,
          order: 1,
          questionId: "question-1",
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockAnswerRepo.create.mockResolvedValue(mockAnswer);

      // When
      const result = await service.createAnswer(
        { questionId: "question-1", optionId: "option-1" },
        "user-1",
      );

      // Then
      expect(result).toEqual(mockAnswer);
      expect(mockAnswerRepo.create).toHaveBeenCalledWith({
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: undefined,
        scaleAnswer: undefined,
      });
    });

    it("척도 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.SCALE,
        order: 1,
        maxSelections: null,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: null,
        textAnswer: null,
        scaleAnswer: 4,
        createdAt: new Date(),
        question: mockQuestion,
        option: null,
      };
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockAnswerRepo.create.mockResolvedValue(mockAnswer);

      // When
      const result = await service.createAnswer(
        { questionId: "question-1", scaleAnswer: 4 },
        "user-1",
      );

      // Then
      expect(result.scaleAnswer).toBe(4);
    });

    it("주관식 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.SUBJECTIVE,
        order: 1,
        maxSelections: null,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: null,
        textAnswer: "주관식 답변",
        scaleAnswer: null,
        createdAt: new Date(),
        question: mockQuestion,
        option: null,
      };
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockAnswerRepo.create.mockResolvedValue(mockAnswer);

      // When
      const result = await service.createAnswer(
        { questionId: "question-1", textAnswer: "주관식 답변" },
        "user-1",
      );

      // Then
      expect(result.textAnswer).toBe("주관식 답변");
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.createAnswer({ questionId: "invalid-id", optionId: "option-1" }, "user-1"),
      ).rejects.toThrow("질문을 찾을 수 없습니다.");

      try {
        await service.createAnswer({ questionId: "invalid-id", optionId: "option-1" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });

    it("객관식에 optionId가 없으면 400 에러를 던진다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: 1,
        maxSelections: 1,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);

      // When & Then
      await expect(service.createAnswer({ questionId: "question-1" }, "user-1")).rejects.toThrow(
        "객관식 답변에는 선택지가 필요합니다.",
      );

      try {
        await service.createAnswer({ questionId: "question-1" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("척도 값이 범위를 벗어나면 400 에러를 던진다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.SCALE,
        order: 1,
        maxSelections: null,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);

      // When & Then
      await expect(
        service.createAnswer({ questionId: "question-1", scaleAnswer: 6 }, "user-1"),
      ).rejects.toThrow("척도 값은 1~5 사이여야 합니다.");

      try {
        await service.createAnswer({ questionId: "question-1", scaleAnswer: 6 }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("주관식에 textAnswer가 없으면 400 에러를 던진다", async () => {
      // Given
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.SUBJECTIVE,
        order: 1,
        maxSelections: null,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);

      // When & Then
      await expect(service.createAnswer({ questionId: "question-1" }, "user-1")).rejects.toThrow(
        "주관식 답변은 필수입니다.",
      );

      try {
        await service.createAnswer({ questionId: "question-1" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("submitAnswers", () => {
    it("Survey 답변을 성공적으로 제출한다", async () => {
      // Given
      const mockSurvey = {
        id: "survey-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockQuestion = {
        id: "question-1",
        title: "질문",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: 1,
        maxSelections: 1,
        surveyId: "survey-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockAnswerRepo.deleteByQuestionsAndUser.mockResolvedValue({ count: 0 });
      mockAnswerRepo.createMany.mockResolvedValue({ count: 1 });

      // When
      const result = await service.submitAnswers(
        {
          surveyId: "survey-1",
          answers: [
            {
              questionId: "question-1",
              type: "MULTIPLE_CHOICE",
              selectedOptionIds: ["option-1"],
            },
          ],
        },
        "user-1",
      );

      // Then
      expect(result.surveyId).toBe("survey-1");
      expect(result.answersCount).toBe(1);
      expect(mockAnswerRepo.deleteByQuestionsAndUser).toHaveBeenCalledWith(
        ["question-1"],
        "user-1",
      );
      expect(mockAnswerRepo.createMany).toHaveBeenCalled();
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            surveyId: "invalid-id",
            answers: [
              { questionId: "q1", type: "MULTIPLE_CHOICE", selectedOptionIds: ["option-1"] },
            ],
          },
          "user-1",
        ),
      ).rejects.toThrow("설문조사를 찾을 수 없습니다.");

      try {
        await service.submitAnswers(
          {
            surveyId: "invalid-id",
            answers: [
              { questionId: "q1", type: "MULTIPLE_CHOICE", selectedOptionIds: ["option-1"] },
            ],
          },
          "user-1",
        );
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });

    it("Survey가 비활성 상태면 400 에러를 던진다", async () => {
      // Given
      const mockSurvey = {
        id: "survey-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: false,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            surveyId: "survey-1",
            answers: [
              { questionId: "q1", type: "MULTIPLE_CHOICE", selectedOptionIds: ["option-1"] },
            ],
          },
          "user-1",
        ),
      ).rejects.toThrow("종료된 설문조사입니다.");

      try {
        await service.submitAnswers(
          {
            surveyId: "survey-1",
            answers: [
              { questionId: "q1", type: "MULTIPLE_CHOICE", selectedOptionIds: ["option-1"] },
            ],
          },
          "user-1",
        );
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("답변이 없으면 400 에러를 던진다", async () => {
      // Given
      const mockSurvey = {
        id: "survey-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(
        service.submitAnswers({ surveyId: "survey-1", answers: [] }, "user-1"),
      ).rejects.toThrow("최소 1개 이상의 답변이 필요합니다.");

      try {
        await service.submitAnswers({ surveyId: "survey-1", answers: [] }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("updateAnswer", () => {
    it("Answer를 성공적으로 수정한다", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: new Date(),
        question: {
          id: "question-1",
          title: "질문",
          description: null,
          imageUrl: null,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: 1,
          maxSelections: 1,
          surveyId: "survey-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        option: {
          id: "option-1",
          title: "선택지",
          description: null,
          imageUrl: null,
          order: 1,
          questionId: "question-1",
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user: {
          id: "user-1",
          name: "사용자",
          email: "user@example.com",
        },
      };
      const mockUpdatedAnswer = { ...mockAnswer, optionId: "option-2" };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer);
      mockAnswerRepo.update.mockResolvedValue(mockUpdatedAnswer);

      // When
      const result = await service.updateAnswer("answer-1", { optionId: "option-2" }, "user-1");

      // Then
      expect(result.optionId).toBe("option-2");
      expect(mockAnswerRepo.update).toHaveBeenCalledWith("answer-1", { optionId: "option-2" });
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: new Date(),
        question: {
          id: "question-1",
          title: "질문",
          description: null,
          imageUrl: null,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: 1,
          maxSelections: 1,
          surveyId: "survey-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        option: {
          id: "option-1",
          title: "선택지",
          description: null,
          imageUrl: null,
          order: 1,
          questionId: "question-1",
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user: {
          id: "user-1",
          name: "사용자",
          email: "user@example.com",
        },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer);

      // When & Then
      await expect(
        service.updateAnswer("answer-1", { optionId: "option-2" }, "user-2"),
      ).rejects.toThrow("수정 권한이 없습니다.");

      try {
        await service.updateAnswer("answer-1", { optionId: "option-2" }, "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });

  describe("deleteAnswer", () => {
    it("Answer를 성공적으로 삭제한다", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: new Date(),
        question: {
          id: "question-1",
          title: "질문",
          description: null,
          imageUrl: null,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: 1,
          maxSelections: 1,
          surveyId: "survey-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        option: {
          id: "option-1",
          title: "선택지",
          description: null,
          imageUrl: null,
          order: 1,
          questionId: "question-1",
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user: {
          id: "user-1",
          name: "사용자",
          email: "user@example.com",
        },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer);
      mockAnswerRepo.delete.mockResolvedValue(mockAnswer);

      // When
      await service.deleteAnswer("answer-1", "user-1");

      // Then
      expect(mockAnswerRepo.delete).toHaveBeenCalledWith("answer-1");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockAnswer = {
        id: "answer-1",
        questionId: "question-1",
        userId: "user-1",
        optionId: "option-1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: new Date(),
        question: {
          id: "question-1",
          title: "질문",
          description: null,
          imageUrl: null,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: 1,
          maxSelections: 1,
          surveyId: "survey-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        option: {
          id: "option-1",
          title: "선택지",
          description: null,
          imageUrl: null,
          order: 1,
          questionId: "question-1",
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user: {
          id: "user-1",
          name: "사용자",
          email: "user@example.com",
        },
      };
      mockAnswerRepo.findById.mockResolvedValue(mockAnswer);

      // When & Then
      await expect(service.deleteAnswer("answer-1", "user-2")).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );

      try {
        await service.deleteAnswer("answer-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });
});
