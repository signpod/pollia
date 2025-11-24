import type { SurveyQuestionOptionRepository } from "@/server/repositories/survey-question-option/surveyQuestionOptionRepository";
import type { SurveyQuestionRepository } from "@/server/repositories/survey-question/surveyQuestionRepository";
import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyQuestionType } from "@prisma/client";
import { SurveyQuestionOptionService } from "./surveyQuestionOptionService";

describe("SurveyQuestionOptionService", () => {
  let service: SurveyQuestionOptionService;
  let mockOptionRepo: jest.Mocked<SurveyQuestionOptionRepository>;
  let mockQuestionRepo: jest.Mocked<SurveyQuestionRepository>;
  let mockSurveyRepo: jest.Mocked<SurveyRepository>;

  beforeEach(() => {
    mockOptionRepo = {
      findById: jest.fn(),
      findByQuestionId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByQuestionId: jest.fn(),
    } as jest.Mocked<SurveyQuestionOptionRepository>;

    mockQuestionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyQuestionRepository>;

    mockSurveyRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyRepository>;

    service = new SurveyQuestionOptionService(mockOptionRepo, mockQuestionRepo, mockSurveyRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getOptionById", () => {
    it("Option을 성공적으로 조회한다", async () => {
      // Given
      const mockOption = {
        id: "option1",
        questionId: "question1",
        title: "옵션 1",
        description: "설명",
        imageUrl: null,
        order: 0,
        fileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOptionRepo.findById.mockResolvedValue(mockOption);

      // When
      const result = await service.getOptionById("option1");

      // Then
      expect(result).toEqual(mockOption);
      expect(mockOptionRepo.findById).toHaveBeenCalledWith("option1");
      expect(mockOptionRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("Option이 없으면 404 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getOptionById("invalid-id")).rejects.toThrow("옵션을 찾을 수 없습니다.");

      try {
        await service.getOptionById("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getOptionsByQuestionId", () => {
    it("Question의 Option 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockQuestion = {
        id: "question1",
        surveyId: "survey1",
        title: "질문 1",
        description: null,
        imageUrl: null,
        type: SurveyQuestionType.MULTIPLE_CHOICE,
        order: 0,
        maxSelections: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockOptions = [
        {
          id: "option1",
          questionId: "question1",
          title: "옵션 1",
          description: null,
          imageUrl: null,
          order: 0,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "option2",
          questionId: "question1",
          title: "옵션 2",
          description: null,
          imageUrl: null,
          order: 1,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockOptionRepo.findByQuestionId.mockResolvedValue(mockOptions);

      // When
      const result = await service.getOptionsByQuestionId("question1");

      // Then
      expect(result).toEqual(mockOptions);
      expect(mockQuestionRepo.findById).toHaveBeenCalledWith("question1");
      expect(mockOptionRepo.findByQuestionId).toHaveBeenCalledWith("question1");
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getOptionsByQuestionId("invalid-id")).rejects.toThrow(
        "질문을 찾을 수 없습니다.",
      );

      expect(mockOptionRepo.findByQuestionId).not.toHaveBeenCalled();
    });
  });

  describe("createOption", () => {
    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "질문 1",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Option을 성공적으로 생성한다", async () => {
      // Given
      const createData = {
        questionId: "question1",
        title: "새 옵션",
        description: "설명",
        imageUrl: "https://example.com/image.jpg",
        order: 0,
        fileUploadId: "file1",
      };
      const mockCreatedOption = {
        id: "option1",
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockOptionRepo.create.mockResolvedValue(mockCreatedOption);

      // When
      const result = await service.createOption(createData, "user1");

      // Then
      expect(result).toEqual(mockCreatedOption);
      expect(mockQuestionRepo.findById).toHaveBeenCalledWith("question1");
      expect(mockSurveyRepo.findById).toHaveBeenCalledWith("survey1");
      expect(mockOptionRepo.create).toHaveBeenCalledWith(createData, "user1");
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        questionId: "question1",
        title: "",
        order: 0,
      };

      // When & Then
      await expect(service.createOption(invalidData, "user1")).rejects.toThrow(
        "옵션 제목은 필수입니다.",
      );

      expect(mockOptionRepo.create).not.toHaveBeenCalled();
    });

    it("제목이 100자를 초과하면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        questionId: "question1",
        title: "a".repeat(101),
        order: 0,
      };

      // When & Then
      await expect(service.createOption(invalidData, "user1")).rejects.toThrow(
        "옵션 제목은 100자를 초과할 수 없습니다.",
      );
    });

    it("순서가 음수면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        questionId: "question1",
        title: "옵션",
        order: -1,
      };

      // When & Then
      await expect(service.createOption(invalidData, "user1")).rejects.toThrow(
        "옵션 순서는 0 이상이어야 합니다.",
      );
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      const createData = {
        questionId: "invalid-question",
        title: "옵션",
        order: 0,
      };

      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.createOption(createData, "user1")).rejects.toThrow(
        "존재하지 않는 질문입니다.",
      );
    });

    it("Survey 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const createData = {
        questionId: "question1",
        title: "옵션",
        order: 0,
      };

      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(service.createOption(createData, "user2")).rejects.toThrow(
        "옵션을 수정할 권한이 없습니다.",
      );

      try {
        await service.createOption(createData, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }
    });
  });

  describe("createOptions", () => {
    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "질문 1",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("여러 Option을 성공적으로 생성한다", async () => {
      // Given
      const options = [
        { title: "옵션 1", order: 0 },
        { title: "옵션 2", order: 1 },
      ];
      const mockCreatedOptions = [
        {
          id: "option1",
          questionId: "question1",
          title: "옵션 1",
          description: null,
          imageUrl: null,
          order: 0,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "option2",
          questionId: "question1",
          title: "옵션 2",
          description: null,
          imageUrl: null,
          order: 1,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockOptionRepo.createMany.mockResolvedValue(mockCreatedOptions);

      // When
      const result = await service.createOptions("question1", options, "user1");

      // Then
      expect(result).toEqual(mockCreatedOptions);
      expect(mockOptionRepo.createMany).toHaveBeenCalledWith("question1", options, "user1");
    });

    it("옵션이 없으면 400 에러를 던진다", async () => {
      // When & Then
      await expect(service.createOptions("question1", [], "user1")).rejects.toThrow(
        "최소 1개 이상의 옵션이 필요합니다.",
      );

      expect(mockOptionRepo.createMany).not.toHaveBeenCalled();
    });
  });

  describe("updateOption", () => {
    const mockOption = {
      id: "option1",
      questionId: "question1",
      title: "기존 옵션",
      description: null,
      imageUrl: null,
      order: 0,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "질문 1",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Option을 성공적으로 수정한다", async () => {
      // Given
      const updateData = {
        title: "수정된 옵션",
        description: "새 설명",
      };
      const mockUpdatedOption = {
        ...mockOption,
        ...updateData,
      };

      mockOptionRepo.findById.mockResolvedValue(mockOption);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockOptionRepo.update.mockResolvedValue(mockUpdatedOption);

      // When
      const result = await service.updateOption("option1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedOption);
      expect(mockOptionRepo.update).toHaveBeenCalledWith("option1", updateData);
    });

    it("Option이 없으면 404 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.updateOption("invalid-id", { title: "수정" }, "user1")).rejects.toThrow(
        "옵션을 찾을 수 없습니다.",
      );
    });

    it("빈 제목으로 수정하려면 400 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(mockOption);

      // When & Then
      await expect(service.updateOption("option1", { title: "" }, "user1")).rejects.toThrow(
        "옵션 제목은 필수입니다.",
      );
    });
  });

  describe("deleteOption", () => {
    const mockOption = {
      id: "option1",
      questionId: "question1",
      title: "옵션",
      description: null,
      imageUrl: null,
      order: 0,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "질문 1",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Option을 성공적으로 삭제한다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(mockOption);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockOptionRepo.delete.mockResolvedValue(mockOption);

      // When
      await service.deleteOption("option1", "user1");

      // Then
      expect(mockOptionRepo.delete).toHaveBeenCalledWith("option1");
    });

    it("Option이 없으면 404 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteOption("invalid-id", "user1")).rejects.toThrow(
        "옵션을 찾을 수 없습니다.",
      );

      expect(mockOptionRepo.delete).not.toHaveBeenCalled();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(mockOption);
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(service.deleteOption("option1", "user2")).rejects.toThrow(
        "옵션을 수정할 권한이 없습니다.",
      );

      expect(mockOptionRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("deleteOptionsByQuestionId", () => {
    const mockQuestion = {
      id: "question1",
      surveyId: "survey1",
      title: "질문 1",
      description: null,
      imageUrl: null,
      type: SurveyQuestionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Question의 모든 Option을 성공적으로 삭제한다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(mockQuestion);
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey);
      mockOptionRepo.deleteByQuestionId.mockResolvedValue({ count: 3 });

      // When
      await service.deleteOptionsByQuestionId("question1", "user1");

      // Then
      expect(mockOptionRepo.deleteByQuestionId).toHaveBeenCalledWith("question1");
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockQuestionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteOptionsByQuestionId("invalid-id", "user1")).rejects.toThrow(
        "존재하지 않는 질문입니다.",
      );

      expect(mockOptionRepo.deleteByQuestionId).not.toHaveBeenCalled();
    });
  });
});
