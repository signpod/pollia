import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyService } from "./surveyService";

describe("SurveyService", () => {
  let surveyService: SurveyService;
  let mockRepository: jest.Mocked<SurveyRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findQuestionIdsBySurveyId: jest.fn(),
      findQuestionById: jest.fn(),
      findQuestionsBySurveyId: jest.fn(),
      findByUserId: jest.fn(),
      createWithQuestions: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<SurveyRepository>;

    surveyService = new SurveyService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSurvey", () => {
    it("Survey가 존재하면 정상적으로 반환한다", async () => {
      // Given: Mock 데이터 설정
      const mockSurvey = {
        id: "survey-1",
        title: "테스트 설문",
        description: "설명",
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: 10,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };
      mockRepository.findById.mockResolvedValue(mockSurvey);

      // When: getSurvey 호출
      const result = await surveyService.getSurvey("survey-1");

      // Then: 결과 검증
      expect(result).toEqual(mockSurvey);
      expect(mockRepository.findById).toHaveBeenCalledWith("survey-1");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given: Repository가 null 반환
      mockRepository.findById.mockResolvedValue(null);

      // When & Then: 에러 검증
      await expect(surveyService.getSurvey("invalid-id")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );

      // 에러 cause 검증
      try {
        await surveyService.getSurvey("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }

      expect(mockRepository.findById).toHaveBeenCalledWith("invalid-id");
    });
  });

  describe("getSurveyQuestionIds", () => {
    it("Survey의 Question ID 목록을 반환한다", async () => {
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
      const mockQuestionIds = ["q1", "q2", "q3"];

      mockRepository.findById.mockResolvedValue(mockSurvey);
      mockRepository.findQuestionIdsBySurveyId.mockResolvedValue(mockQuestionIds);

      // When
      const result = await surveyService.getSurveyQuestionIds("survey-1");

      // Then
      expect(result).toEqual({ questionIds: ["q1", "q2", "q3"] });
      expect(mockRepository.findById).toHaveBeenCalledWith("survey-1");
      expect(mockRepository.findQuestionIdsBySurveyId).toHaveBeenCalledWith("survey-1");
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(surveyService.getSurveyQuestionIds("invalid-id")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );

      // findQuestionIdsBySurveyId가 호출되지 않았는지 확인
      expect(mockRepository.findQuestionIdsBySurveyId).not.toHaveBeenCalled();
    });
  });

  describe("getQuestionById", () => {
    it("Question이 존재하면 정상적으로 반환한다", async () => {
      // Given
      const mockQuestion = {
        id: "q1",
        title: "질문 1",
        description: "설명",
        imageUrl: null,
        type: "MULTIPLE_CHOICE" as const,
        order: 1,
        maxSelections: 1,
        surveyId: "survey-1",
        options: [
          {
            id: "opt1",
            title: "선택지 1",
            description: null,
            imageUrl: null,
            order: 1,
          },
          {
            id: "opt2",
            title: "선택지 2",
            description: null,
            imageUrl: null,
            order: 2,
          },
        ],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };
      mockRepository.findQuestionById.mockResolvedValue(mockQuestion);

      // When
      const result = await surveyService.getQuestionById("q1");

      // Then
      expect(result).toEqual(mockQuestion);
      expect(mockRepository.findQuestionById).toHaveBeenCalledWith("q1");
      expect(mockRepository.findQuestionById).toHaveBeenCalledTimes(1);
    });

    it("Question이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findQuestionById.mockResolvedValue(null);

      // When & Then
      await expect(surveyService.getQuestionById("invalid-id")).rejects.toThrow(
        "질문을 찾을 수 없습니다.",
      );

      // 에러 cause 검증
      try {
        await surveyService.getQuestionById("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });
  });

  describe("getSurveyQuestionsDetail", () => {
    it("Survey의 모든 Question 상세를 반환한다", async () => {
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

      const mockQuestions = [
        {
          id: "q1",
          title: "질문 1",
          description: null,
          imageUrl: null,
          type: "MULTIPLE_CHOICE" as const,
          order: 1,
          maxSelections: 1,
          surveyId: "survey-1",
          options: [
            {
              id: "opt1",
              title: "선택지 1",
              description: null,
              imageUrl: null,
              order: 1,
            },
          ],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "q2",
          title: "질문 2",
          description: null,
          imageUrl: null,
          type: "SCALE" as const,
          order: 2,
          maxSelections: null,
          surveyId: "survey-1",
          options: [],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      mockRepository.findById.mockResolvedValue(mockSurvey);
      mockRepository.findQuestionsBySurveyId.mockResolvedValue(mockQuestions);

      // When
      const result = await surveyService.getSurveyQuestionsDetail("survey-1");

      // Then
      expect(result).toEqual(mockQuestions);
      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe("질문 1");
      expect(result[1]?.title).toBe("질문 2");
      expect(mockRepository.findById).toHaveBeenCalledWith("survey-1");
      expect(mockRepository.findQuestionsBySurveyId).toHaveBeenCalledWith("survey-1");
      expect(mockRepository.findQuestionsBySurveyId).toHaveBeenCalledTimes(1);
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(surveyService.getSurveyQuestionsDetail("invalid-id")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );

      // findQuestionsBySurveyId가 호출되지 않았는지 확인
      expect(mockRepository.findQuestionsBySurveyId).not.toHaveBeenCalled();
    });

    it("Survey는 존재하지만 Question이 없으면 빈 배열을 반환한다", async () => {
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

      mockRepository.findById.mockResolvedValue(mockSurvey);
      mockRepository.findQuestionsBySurveyId.mockResolvedValue([]);

      // When
      const result = await surveyService.getSurveyQuestionsDetail("survey-1");

      // Then
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("getUserSurveys", () => {
    it("User의 Survey 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockSurveys = [
        {
          id: "survey-1",
          title: "설문 1",
          description: null,
          target: null,
          imageUrl: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "survey-2",
          title: "설문 2",
          description: "설명",
          target: null,
          imageUrl: null,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];
      mockRepository.findByUserId.mockResolvedValue(mockSurveys);

      // When
      const result = await surveyService.getUserSurveys("user-1");

      // Then
      expect(result).toEqual(mockSurveys);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
        limit: 10,
      });
    });

    it("limit보다 많은 Survey가 있을 때 마지막 항목을 제거한다", async () => {
      // Given
      const mockSurveys = [
        {
          id: "survey-1",
          title: "설문 1",
          description: null,
          target: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "survey-2",
          title: "설문 2",
          description: null,
          target: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "survey-3",
          title: "설문 3",
          description: null,
          target: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockRepository.findByUserId.mockResolvedValue(mockSurveys);

      // When
      const result = await surveyService.getUserSurveys("user-1", { limit: 2 });

      // Then
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("survey-1");
      expect(result[1]?.id).toBe("survey-2");
    });
  });

  describe("createSurvey", () => {
    it("Survey를 성공적으로 생성한다", async () => {
      // Given
      const request = {
        title: "새 설문",
        description: "설명",
        target: null,
        imageUrl: null,
        deadline: new Date("2024-12-31"),
        estimatedMinutes: 10,
        questionIds: ["q1", "q2"],
      };
      const mockCreatedSurvey = {
        id: "survey-1",
        title: request.title,
        description: request.description,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        deadline: request.deadline,
        estimatedMinutes: request.estimatedMinutes,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.createWithQuestions.mockResolvedValue(mockCreatedSurvey);

      // When
      const result = await surveyService.createSurvey(request, "user-1");

      // Then
      expect(result.id).toBe("survey-1");
      expect(result.title).toBe("새 설문");
      expect(mockRepository.createWithQuestions).toHaveBeenCalledWith(
        {
          title: request.title,
          description: request.description,
          target: null,
          imageUrl: null,
          deadline: request.deadline,
          estimatedMinutes: request.estimatedMinutes,
          creatorId: "user-1",
        },
        ["q1", "q2"],
      );
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        description: null,
        target: null,
        imageUrl: null,
        deadline: undefined,
        estimatedMinutes: undefined,
        questionIds: ["q1"],
      };

      // When & Then
      await expect(surveyService.createSurvey(request, "user-1")).rejects.toThrow(
        "제목은 필수입니다.",
      );

      try {
        await surveyService.createSurvey(request, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("질문이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        deadline: undefined,
        estimatedMinutes: undefined,
        questionIds: [],
      };

      // When & Then
      await expect(surveyService.createSurvey(request, "user-1")).rejects.toThrow(
        "최소 1개 이상의 질문이 필요합니다.",
      );

      try {
        await surveyService.createSurvey(request, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("updateSurvey", () => {
    it("Survey를 성공적으로 수정한다", async () => {
      // Given
      const mockSurvey = {
        id: "survey-1",
        title: "기존 설문",
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
      const mockUpdatedSurvey = {
        ...mockSurvey,
        title: "수정된 설문",
        description: "수정된 설명",
      };
      mockRepository.findById.mockResolvedValue(mockSurvey);
      mockRepository.update.mockResolvedValue(mockUpdatedSurvey);

      // When
      const result = await surveyService.updateSurvey(
        "survey-1",
        { title: "수정된 설문", description: "수정된 설명" },
        "user-1",
      );

      // Then
      expect(result.title).toBe("수정된 설문");
      expect(result.description).toBe("수정된 설명");
      expect(mockRepository.update).toHaveBeenCalledWith("survey-1", {
        title: "수정된 설문",
        description: "수정된 설명",
      });
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        surveyService.updateSurvey("invalid-id", { title: "수정" }, "user-1"),
      ).rejects.toThrow("설문조사를 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
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
      mockRepository.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(
        surveyService.updateSurvey("survey-1", { title: "수정" }, "user-2"),
      ).rejects.toThrow("수정 권한이 없습니다.");

      try {
        await surveyService.updateSurvey("survey-1", { title: "수정" }, "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });

    it("빈 제목으로 수정하면 400 에러를 던진다", async () => {
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
      mockRepository.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(surveyService.updateSurvey("survey-1", { title: "" }, "user-1")).rejects.toThrow(
        "제목은 필수입니다.",
      );

      try {
        await surveyService.updateSurvey("survey-1", { title: "" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("deleteSurvey", () => {
    it("Survey를 성공적으로 삭제한다", async () => {
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
      mockRepository.findById.mockResolvedValue(mockSurvey);
      mockRepository.delete.mockResolvedValue(mockSurvey);

      // When
      await surveyService.deleteSurvey("survey-1", "user-1");

      // Then
      expect(mockRepository.delete).toHaveBeenCalledWith("survey-1");
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(surveyService.deleteSurvey("invalid-id", "user-1")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
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
      mockRepository.findById.mockResolvedValue(mockSurvey);

      // When & Then
      await expect(surveyService.deleteSurvey("survey-1", "user-2")).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );

      try {
        await surveyService.deleteSurvey("survey-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });
});
