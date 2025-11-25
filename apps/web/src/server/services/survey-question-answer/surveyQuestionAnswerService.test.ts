import type { SurveyQuestionAnswerRepository } from "@/server/repositories/survey-question-answer/surveyQuestionAnswerRepository";
import type { SurveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import type { SurveyResponseRepository } from "@/server/repositories/survey-response/surveyResponseRepository";
import { SurveyQuestionType } from "@prisma/client";
import { SurveyQuestionAnswerService } from "./surveyQuestionAnswerService";

describe("SurveyQuestionAnswerService", () => {
  let service: SurveyQuestionAnswerService;
  let mockAnswerRepo: jest.Mocked<SurveyQuestionAnswerRepository>;
  let mockResponseRepo: jest.Mocked<SurveyResponseRepository>;
  let mockQuestionRepo: jest.Mocked<SurveyQuestionRepository>;

  const mockUser = { id: "user1" };
  const now = new Date();

  beforeEach(() => {
    mockAnswerRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByResponseId: jest.fn(),
      findByQuestionId: jest.fn(),
      findByResponseAndQuestion: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByResponseId: jest.fn(),
      deleteByResponseAndQuestions: jest.fn(),
    } as unknown as jest.Mocked<SurveyQuestionAnswerRepository>;

    mockResponseRepo = {
      findById: jest.fn(),
      findBySurveyAndUser: jest.fn(),
      findBySurveyId: jest.fn(),
      findByUserId: jest.fn(),
      findCompletedBySurveyId: jest.fn(),
      create: jest.fn(),
      updateCompletedAt: jest.fn(),
      delete: jest.fn(),
      deleteBySurveyAndUser: jest.fn(),
      countBySurveyId: jest.fn(),
      countCompletedBySurveyId: jest.fn(),
    } as unknown as jest.Mocked<SurveyResponseRepository>;

    mockQuestionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyQuestionRepository>;

    service = new SurveyQuestionAnswerService(mockAnswerRepo, mockResponseRepo, mockQuestionRepo);
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
        questionId: "question1",
        optionId: "option1",
        textAnswer: null,
        scaleAnswer: null,
        createdAt: now,
        response: { id: "response1", userId: "user1", surveyId: "survey1" },
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
        response: { id: "response1", userId: "other-user", surveyId: "survey1" },
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
      const mockResponse = { id: "response1", userId: "user1", surveyId: "survey1" };
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
      const mockResponse = { id: "response1", userId: "user1", surveyId: "survey1" };
      const mockQuestion = {
        id: "question1",
        surveyId: "survey1",
        type: SurveyQuestionType.MULTIPLE_CHOICE,
      };
      const mockCreatedAnswer = {
        id: "answer1",
        responseId: "response1",
        questionId: "question1",
        optionId: "option1",
      };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);
      mockAnswerRepo.create.mockResolvedValue(mockCreatedAnswer as never);

      // When
      const result = await service.createAnswer(
        { responseId: "response1", questionId: "question1", optionId: "option1" },
        mockUser.id,
      );

      // Then
      expect(result).toEqual(mockCreatedAnswer);
      expect(mockAnswerRepo.create).toHaveBeenCalled();
    });

    it("척도 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", surveyId: "survey1" };
      const mockQuestion = { id: "question1", surveyId: "survey1", type: SurveyQuestionType.SCALE };
      const mockCreatedAnswer = { id: "answer1", scaleAnswer: 4 };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);
      mockAnswerRepo.create.mockResolvedValue(mockCreatedAnswer as never);

      // When
      const result = await service.createAnswer(
        { responseId: "response1", questionId: "question1", scaleAnswer: 4 },
        mockUser.id,
      );

      // Then
      expect(result).toEqual(mockCreatedAnswer);
    });

    it("주관식 Answer를 성공적으로 생성한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", surveyId: "survey1" };
      const mockQuestion = {
        id: "question1",
        surveyId: "survey1",
        type: SurveyQuestionType.SUBJECTIVE,
      };
      const mockCreatedAnswer = { id: "answer1", textAnswer: "답변 내용" };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);
      mockAnswerRepo.create.mockResolvedValue(mockCreatedAnswer as never);

      // When
      const result = await service.createAnswer(
        { responseId: "response1", questionId: "question1", textAnswer: "답변 내용" },
        mockUser.id,
      );

      // Then
      expect(result).toEqual(mockCreatedAnswer);
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.createAnswer(
          { responseId: "response1", questionId: "invalid-question", optionId: "option1" },
          mockUser.id,
        ),
      ).rejects.toThrow("질문을 찾을 수 없습니다.");
    });

    it("객관식 질문에 optionId 없으면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      const mockQuestion = { id: "question1", type: SurveyQuestionType.MULTIPLE_CHOICE };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);

      // When & Then
      await expect(
        service.createAnswer({ responseId: "response1", questionId: "question1" }, mockUser.id),
      ).rejects.toThrow("객관식 답변에는 선택지가 필요합니다.");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.createAnswer(
          { responseId: "invalid-response", questionId: "question1", optionId: "option1" },
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
        surveyId: "survey1",
        userId: "user1",
        completedAt: null,
      };
      const mockQuestions = [
        { id: "q1", surveyId: "survey1", type: SurveyQuestionType.MULTIPLE_CHOICE },
        { id: "q2", surveyId: "survey1", type: SurveyQuestionType.SCALE },
      ];

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById
        .mockResolvedValueOnce(mockQuestions[0] as never)
        .mockResolvedValueOnce(mockQuestions[1] as never);
      mockAnswerRepo.deleteByResponseAndQuestions.mockResolvedValue({ count: 0 });
      mockAnswerRepo.createMany.mockResolvedValue({ count: 3 });

      // When
      const result = await service.submitAnswers(
        {
          responseId: "response1",
          answers: [
            {
              questionId: "q1",
              type: SurveyQuestionType.MULTIPLE_CHOICE,
              selectedOptionIds: ["opt1", "opt2"],
            },
            { questionId: "q2", type: SurveyQuestionType.SCALE, scaleValue: 4 },
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
            answers: [{ questionId: "q1", type: SurveyQuestionType.SCALE, scaleValue: 3 }],
          },
          mockUser.id,
        ),
      ).rejects.toThrow("이미 완료된 응답입니다.");
    });

    it("다른 Survey의 질문이 포함되면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = {
        id: "response1",
        surveyId: "survey1",
        userId: "user1",
        completedAt: null,
      };
      const mockQuestion = { id: "q1", surveyId: "other-survey", type: SurveyQuestionType.SCALE };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            responseId: "response1",
            answers: [{ questionId: "q1", type: SurveyQuestionType.SCALE, scaleValue: 3 }],
          },
          mockUser.id,
        ),
      ).rejects.toThrow("유효하지 않은 질문이 포함되어 있습니다.");
    });

    it("답변 타입이 질문 타입과 다르면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = {
        id: "response1",
        surveyId: "survey1",
        userId: "user1",
        completedAt: null,
      };
      const mockQuestion = { id: "q1", surveyId: "survey1", type: SurveyQuestionType.SCALE };

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);

      // When & Then
      await expect(
        service.submitAnswers(
          {
            responseId: "response1",
            answers: [
              {
                questionId: "q1",
                type: SurveyQuestionType.MULTIPLE_CHOICE,
                selectedOptionIds: ["opt1"],
              },
            ],
          },
          mockUser.id,
        ),
      ).rejects.toThrow("답변 타입이 질문 타입과 일치하지 않습니다.");
    });
  });

  describe("updateAnswer", () => {
    it("Answer를 성공적으로 수정한다", async () => {
      // Given
      const mockAnswer = {
        id: "answer1",
        questionId: "question1",
        optionId: "option1",
        response: { userId: "user1" },
      };
      const mockQuestion = { id: "question1", type: SurveyQuestionType.MULTIPLE_CHOICE };
      const mockUpdatedAnswer = { ...mockAnswer, optionId: "option2" };

      mockAnswerRepo.findById.mockResolvedValue(mockAnswer as never);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion as never);
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
