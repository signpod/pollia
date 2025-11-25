import type { SurveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyQuestionType } from "@prisma/client";
import { SurveyQuestionService } from "./surveyQuestionService";

describe("SurveyQuestionService", () => {
  let service: SurveyQuestionService;
  let mockQuestionRepo: jest.Mocked<SurveyQuestionRepository>;
  let mockSurveyRepo: jest.Mocked<SurveyRepository>;

  beforeEach(() => {
    mockQuestionRepo = {
      findById: jest.fn(),
      findByIdWithOptions: jest.fn(),
      findQuestionIdsBySurveyId: jest.fn(),
      findDetailsBySurveyId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMultipleChoice: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<SurveyQuestionRepository>;

    mockSurveyRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyRepository>;

    service = new SurveyQuestionService(mockQuestionRepo, mockSurveyRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getQuestionById", () => {
    it("Question을 성공적으로 조회한다", async () => {
      // Given
      const mockQuestion = {
        id: "question1",
        surveyId: "survey1",
        title: "질문 제목",
        description: "질문 설명",
        imageUrl: null,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: 0,
        maxSelections: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: "option1",
            title: "옵션 1",
            description: null,
            imageUrl: null,
            order: 0,
          },
        ],
      };
      mockQuestionRepo.findByIdWithOptions.mockResolvedValue(mockQuestion);

      // When
      const result = await service.getQuestionById("question1");

      // Then
      expect(result).toEqual(mockQuestion);
      expect(mockQuestionRepo.findByIdWithOptions).toHaveBeenCalledWith("question1");
      expect(mockQuestionRepo.findByIdWithOptions).toHaveBeenCalledTimes(1);
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findByIdWithOptions.mockResolvedValue(null);

      // When & Then
      await expect(service.getQuestionById("invalid-id")).rejects.toThrow(
        "질문을 찾을 수 없습니다.",
      );

      try {
        await service.getQuestionById("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getSurveyQuestionIds", () => {
    it("Survey의 Question ID 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockSurvey = {
        id: "survey1",
        title: "설문조사",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockQuestionIds = ["question1", "question2", "question3"];

      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.findQuestionIdsBySurveyId.mockResolvedValue(mockQuestionIds);

      // When
      const result = await service.getSurveyQuestionIds("survey1");

      // Then
      expect(result).toEqual({ questionIds: mockQuestionIds });
      expect(mockSurveyRepo.findById).toHaveBeenCalledWith("survey1");
      expect(mockQuestionRepo.findQuestionIdsBySurveyId).toHaveBeenCalledWith("survey1");
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getSurveyQuestionIds("invalid-id")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );

      expect(mockQuestionRepo.findQuestionIdsBySurveyId).not.toHaveBeenCalled();
    });
  });

  describe("getSurveyQuestionsDetail", () => {
    it("Survey의 Question 상세 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockSurvey = {
        id: "survey1",
        title: "설문조사",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockQuestions = [
        {
          id: "question1",
          surveyId: "survey1",
          title: "질문 1",
          description: null,
          imageUrl: null,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: 0,
          maxSelections: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
        },
      ];

      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.findDetailsBySurveyId.mockResolvedValue(mockQuestions);

      // When
      const result = await service.getSurveyQuestionsDetail("survey1");

      // Then
      expect(result).toEqual(mockQuestions);
      expect(mockSurveyRepo.findById).toHaveBeenCalledWith("survey1");
      expect(mockQuestionRepo.findDetailsBySurveyId).toHaveBeenCalledWith("survey1");
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getSurveyQuestionsDetail("invalid-id")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );
    });
  });

  describe("getQuestions", () => {
    it("Question 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockQuestions = [
        {
          id: "question1",
          title: "질문 1",
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          description: null,
          imageUrl: null,
          maxSelections: 1,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          surveyId: "survey1",
        },
        {
          id: "question2",
          title: "질문 2",
          type: SurveyQuestionType.SCALE,
          description: null,
          imageUrl: null,
          maxSelections: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          surveyId: "survey1",
        },
      ];

      mockQuestionRepo.findMany.mockResolvedValue(mockQuestions);

      // When
      const result = await service.getQuestions({ limit: 10 });

      // Then
      expect(result).toEqual(mockQuestions);
      expect(mockQuestionRepo.findMany).toHaveBeenCalledWith({ limit: 10 });
    });

    it("limit을 초과하는 결과는 마지막 항목을 제거한다", async () => {
      // Given
      const mockQuestions = [
        {
          id: "question1",
          title: "질문 1",
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          description: null,
          imageUrl: null,
          maxSelections: 1,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          surveyId: "survey1",
        },
        {
          id: "question2",
          title: "질문 2",
          type: SurveyQuestionType.SCALE,
          description: null,
          imageUrl: null,
          maxSelections: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          surveyId: "survey1",
        },
        {
          id: "question3",
          title: "질문 3",
          type: SurveyQuestionType.SUBJECTIVE,
          description: null,
          imageUrl: null,
          maxSelections: null,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          surveyId: "survey1",
        },
      ];

      mockQuestionRepo.findMany.mockResolvedValue(mockQuestions);

      // When
      const result = await service.getQuestions({ limit: 2 });

      // Then
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe("question1");
      expect(result[1]?.id).toBe("question2");
    });
  });

  describe("createMultipleChoiceQuestion", () => {
    const mockSurvey = {
      id: "survey1",
      title: "설문조사",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Multiple Choice Question을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        surveyId: "survey1",
        title: "좋아하는 색은?",
        description: "하나를 선택하세요",
        imageUrl: undefined,
        order: 0,
        maxSelections: 1,
        options: [
          {
            title: "빨강",
            description: undefined,
            imageUrl: undefined,
            order: 0,
            imageFileUploadId: undefined,
          },
          {
            title: "파랑",
            description: undefined,
            imageUrl: undefined,
            order: 1,
            imageFileUploadId: undefined,
          },
        ],
      };
      const mockCreatedQuestion = {
        id: "question1",
        surveyId: "survey1",
        title: request.title,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: request.maxSelections,
        description: request.description,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.createMultipleChoice.mockResolvedValue(mockCreatedQuestion);

      // When
      const result = await service.createMultipleChoiceQuestion(request, "user1");

      // Then
      expect(result.id).toBe("question1");
      expect(result.title).toBe(request.title);
      expect(mockSurveyRepo.findById).toHaveBeenCalledWith("survey1");
      expect(mockQuestionRepo.createMultipleChoice).toHaveBeenCalledWith(
        {
          surveyId: "survey1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: SurveyQuestionType.MULTIPLE_CHOICE,
          order: request.order,
          maxSelections: request.maxSelections,
        },
        request.options,
        "user1",
      );
    });

    it("Survey 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const request = {
        surveyId: "survey1",
        title: "질문",
        order: 0,
        maxSelections: 1,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(service.createMultipleChoiceQuestion(request, "user2")).rejects.toThrow(
        "질문을 추가할 권한이 없습니다.",
      );

      try {
        await service.createMultipleChoiceQuestion(request, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(mockQuestionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        surveyId: "invalid-survey",
        title: "질문",
        order: 0,
        maxSelections: 1,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.createMultipleChoiceQuestion(request, "user1")).rejects.toThrow(
        "존재하지 않는 설문조사입니다.",
      );
    });

    it("옵션이 2개 미만이면 400 에러를 던진다", async () => {
      // Given
      const request = {
        surveyId: "survey1",
        title: "질문",
        order: 0,
        maxSelections: 1,
        options: [{ title: "옵션 1", order: 0 }],
      };

      // When & Then
      await expect(service.createMultipleChoiceQuestion(request, "user1")).rejects.toThrow(
        "최소 2개 이상의 항목이 필요합니다.",
      );

      try {
        await service.createMultipleChoiceQuestion(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(mockQuestionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        surveyId: "survey1",
        title: "질문",
        order: 0,
        maxSelections: 1,
        options: [],
      };

      // When & Then
      await expect(service.createMultipleChoiceQuestion(request, "user1")).rejects.toThrow(
        "최소 2개 이상의 항목이 필요합니다.",
      );

      expect(mockQuestionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("createScaleQuestion", () => {
    const mockSurvey = {
      id: "survey1",
      title: "설문조사",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Scale Question을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        surveyId: "survey1",
        title: "만족도를 평가해주세요",
        description: "1-5점",
        imageUrl: undefined,
        order: 0,
      };
      const mockCreatedQuestion = {
        id: "question1",
        surveyId: "survey1",
        title: request.title,
        type: SurveyQuestionType.SCALE,
        order: request.order,
        maxSelections: null,
        description: request.description,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.create.mockResolvedValue(mockCreatedQuestion);

      // When
      const result = await service.createScaleQuestion(request, "user1");

      // Then
      expect(result.id).toBe("question1");
      expect(result.type).toBe(SurveyQuestionType.SCALE);
      expect(mockQuestionRepo.create).toHaveBeenCalledWith({
        surveyId: "survey1",
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        type: SurveyQuestionType.SCALE,
        order: request.order,
      });
    });
  });

  describe("createSubjectiveQuestion", () => {
    const mockSurvey = {
      id: "survey1",
      title: "설문조사",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Subjective Question을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        surveyId: "survey1",
        title: "의견을 자유롭게 작성해주세요",
        description: "상세히 작성해주세요",
        imageUrl: undefined,
        order: 0,
      };
      const mockCreatedQuestion = {
        id: "question1",
        surveyId: "survey1",
        title: request.title,
        type: SurveyQuestionType.SUBJECTIVE,
        order: request.order,
        maxSelections: null,
        description: request.description,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.create.mockResolvedValue(mockCreatedQuestion);

      // When
      const result = await service.createSubjectiveQuestion(request, "user1");

      // Then
      expect(result.id).toBe("question1");
      expect(result.type).toBe(SurveyQuestionType.SUBJECTIVE);
      expect(mockQuestionRepo.create).toHaveBeenCalledWith({
        surveyId: "survey1",
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        type: SurveyQuestionType.SUBJECTIVE,
        order: request.order,
      });
    });
  });

  describe("createEitherOrQuestion", () => {
    it("Either Or Question을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        title: "A와 B 중 선택하세요",
        order: 0,
      };
      const mockCreatedQuestion = {
        id: "question1",
        surveyId: null,
        title: request.title,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: null,
        description: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQuestionRepo.create.mockResolvedValue(mockCreatedQuestion);

      // When
      const result = await service.createEitherOrQuestion(request, "user1");

      // Then
      expect(result.id).toBe("question1");
      expect(result.type).toBe(SurveyQuestionType.MULTIPLE_CHOICE);
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        order: 0,
      };

      // When & Then
      await expect(service.createEitherOrQuestion(request, "user1")).rejects.toThrow(
        "제목을 입력해주세요.",
      );

      expect(mockQuestionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("updateQuestion", () => {
    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "기존 질문",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSurvey = {
      id: "survey1",
      title: "설문조사",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Question을 성공적으로 수정한다", async () => {
      // Given
      const updateData = {
        title: "수정된 질문",
        description: "새 설명",
      };
      const mockUpdatedQuestion = {
        ...mockQuestion,
        ...updateData,
      };

      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.update.mockResolvedValue(mockUpdatedQuestion);

      // When
      const result = await service.updateQuestion("question1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedQuestion);
      expect(mockQuestionRepo.update).toHaveBeenCalledWith("question1", updateData);
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.updateQuestion("invalid-id", { title: "수정" }, "user1"),
      ).rejects.toThrow("질문을 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(service.updateQuestion("question1", { title: "수정" }, "user2")).rejects.toThrow(
        "질문을 추가할 권한이 없습니다.",
      );

      expect(mockQuestionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteQuestion", () => {
    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "질문",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSurvey = {
      id: "survey1",
      title: "설문조사",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Question을 성공적으로 삭제한다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockQuestionRepo.delete.mockResolvedValue(mockQuestion);

      // When
      await service.deleteQuestion("question1", "user1");

      // Then
      expect(mockQuestionRepo.delete).toHaveBeenCalledWith("question1");
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteQuestion("invalid-id", "user1")).rejects.toThrow(
        "질문을 찾을 수 없습니다.",
      );

      expect(mockQuestionRepo.delete).not.toHaveBeenCalled();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(service.deleteQuestion("question1", "user2")).rejects.toThrow(
        "질문을 추가할 권한이 없습니다.",
      );

      expect(mockQuestionRepo.delete).not.toHaveBeenCalled();
    });
  });
});
