import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyService } from "./surveyService";

describe("SurveyService", () => {
  let surveyService: SurveyService;
  let mockRepository: jest.Mocked<SurveyRepository>;

  beforeEach(() => {
    // Repository를 Mock으로 생성
    mockRepository = {
      findById: jest.fn(),
      findQuestionIdsBySurveyId: jest.fn(),
      findQuestionById: jest.fn(),
      findQuestionsBySurveyId: jest.fn(),
    } as jest.Mocked<SurveyRepository>;

    // Service에 Mock Repository 주입
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

  describe("통합 시나리오", () => {
    it("여러 메서드를 순차적으로 호출할 수 있다", async () => {
      // Given
      const mockSurvey = {
        id: "survey-1",
        title: "통합 테스트 설문",
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

      const mockQuestionIds = ["q1", "q2"];

      const mockQuestion = {
        id: "q1",
        title: "질문 1",
        description: null,
        imageUrl: null,
        type: "MULTIPLE_CHOICE" as const,
        order: 1,
        maxSelections: 1,
        surveyId: "survey-1",
        options: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockSurvey);
      mockRepository.findQuestionIdsBySurveyId.mockResolvedValue(mockQuestionIds);
      mockRepository.findQuestionById.mockResolvedValue(mockQuestion);

      // When: 순차적으로 호출
      const survey = await surveyService.getSurvey("survey-1");
      const questionIds = await surveyService.getSurveyQuestionIds("survey-1");
      const question = await surveyService.getQuestionById("q1");

      // Then
      expect(survey.id).toBe("survey-1");
      expect(questionIds.questionIds).toEqual(["q1", "q2"]);
      expect(question.id).toBe("q1");

      // 각 메서드가 올바르게 호출되었는지 확인
      expect(mockRepository.findById).toHaveBeenCalledTimes(2); // getSurvey + getSurveyQuestionIds
      expect(mockRepository.findQuestionIdsBySurveyId).toHaveBeenCalledTimes(1);
      expect(mockRepository.findQuestionById).toHaveBeenCalledTimes(1);
    });
  });
});
