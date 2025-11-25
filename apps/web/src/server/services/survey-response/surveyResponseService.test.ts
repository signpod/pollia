import type { SurveyResponseRepository } from "@/server/repositories/survey-response/surveyResponseRepository";
import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";
import { SurveyResponseService } from "./surveyResponseService";

describe("SurveyResponseService", () => {
  let service: SurveyResponseService;
  let mockResponseRepo: jest.Mocked<SurveyResponseRepository>;
  let mockSurveyRepo: jest.Mocked<SurveyRepository>;

  const mockUser = { id: "user1" };
  const now = new Date();

  beforeEach(() => {
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

    mockSurveyRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<SurveyRepository>;

    service = new SurveyResponseService(mockResponseRepo, mockSurveyRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getResponseById", () => {
    it("Response를 성공적으로 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", surveyId: "survey1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.getResponseById("response1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockResponseRepo.findById).toHaveBeenCalledWith("response1");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getResponseById("invalid-id", mockUser.id)).rejects.toThrow(
        "응답을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 Response 조회 시 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(service.getResponseById("response1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getResponseBySurveyAndUser", () => {
    it("Survey와 User로 Response를 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", surveyId: "survey1", userId: "user1" };
      mockResponseRepo.findBySurveyAndUser.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.getResponseBySurveyAndUser("survey1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockResponseRepo.findBySurveyAndUser).toHaveBeenCalledWith("survey1", mockUser.id);
    });

    it("Response가 없으면 null을 반환한다", async () => {
      // Given
      mockResponseRepo.findBySurveyAndUser.mockResolvedValue(null);

      // When
      const result = await service.getResponseBySurveyAndUser("survey1", mockUser.id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("getUserResponses", () => {
    it("사용자의 모든 Response를 조회한다", async () => {
      // Given
      const mockResponses = [
        { id: "response1", surveyId: "survey1" },
        { id: "response2", surveyId: "survey2" },
      ];
      mockResponseRepo.findByUserId.mockResolvedValue(mockResponses as never);

      // When
      const result = await service.getUserResponses(mockUser.id);

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockResponseRepo.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("getSurveyResponses", () => {
    it("Survey 소유자가 모든 Response를 조회한다", async () => {
      // Given
      const mockSurvey = { id: "survey1", creatorId: "user1" };
      const mockResponses = [{ id: "response1" }, { id: "response2" }];
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);
      mockResponseRepo.findBySurveyId.mockResolvedValue(mockResponses as never);

      // When
      const result = await service.getSurveyResponses("survey1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockResponseRepo.findBySurveyId).toHaveBeenCalledWith("survey1");
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getSurveyResponses("invalid-survey", mockUser.id)).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );
    });

    it("Survey 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockSurvey = { id: "survey1", creatorId: "other-user" };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);

      // When & Then
      await expect(service.getSurveyResponses("survey1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getSurveyStats", () => {
    it("Survey 통계를 성공적으로 조회한다", async () => {
      // Given
      const mockSurvey = { id: "survey1", creatorId: "user1" };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);
      mockResponseRepo.countBySurveyId.mockResolvedValue(10);
      mockResponseRepo.countCompletedBySurveyId.mockResolvedValue(7);

      // When
      const result = await service.getSurveyStats("survey1", mockUser.id);

      // Then
      expect(result).toEqual({
        total: 10,
        completed: 7,
        completionRate: 70,
      });
    });

    it("응답이 없으면 completionRate는 0이다", async () => {
      // Given
      const mockSurvey = { id: "survey1", creatorId: "user1" };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);
      mockResponseRepo.countBySurveyId.mockResolvedValue(0);
      mockResponseRepo.countCompletedBySurveyId.mockResolvedValue(0);

      // When
      const result = await service.getSurveyStats("survey1", mockUser.id);

      // Then
      expect(result.completionRate).toBe(0);
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getSurveyStats("invalid-survey", mockUser.id)).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );
    });

    it("Survey 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockSurvey = { id: "survey1", creatorId: "other-user" };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);

      // When & Then
      await expect(service.getSurveyStats("survey1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("startResponse", () => {
    it("새 Response를 생성한다", async () => {
      // Given
      const mockSurvey = { id: "survey1", isActive: true };
      const mockCreatedResponse = { id: "response1", surveyId: "survey1", userId: "user1" };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);
      mockResponseRepo.findBySurveyAndUser.mockResolvedValue(null);
      mockResponseRepo.create.mockResolvedValue(mockCreatedResponse as never);

      // When
      const result = await service.startResponse({ surveyId: "survey1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockCreatedResponse);
      expect(mockResponseRepo.create).toHaveBeenCalledWith({
        surveyId: "survey1",
        userId: mockUser.id,
      });
    });

    it("이미 응답이 있으면 기존 Response를 반환한다", async () => {
      // Given
      const mockSurvey = { id: "survey1", isActive: true };
      const mockExistingResponse = { id: "response1", surveyId: "survey1", userId: "user1" };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);
      mockResponseRepo.findBySurveyAndUser.mockResolvedValue(mockExistingResponse as never);

      // When
      const result = await service.startResponse({ surveyId: "survey1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockExistingResponse);
      expect(mockResponseRepo.create).not.toHaveBeenCalled();
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockSurveyRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.startResponse({ surveyId: "invalid-survey" }, mockUser.id),
      ).rejects.toThrow("설문조사를 찾을 수 없습니다.");
    });

    it("종료된 Survey면 400 에러를 던진다", async () => {
      // Given
      const mockSurvey = { id: "survey1", isActive: false };
      mockSurveyRepo.findById.mockResolvedValue(mockSurvey as never);

      // When & Then
      await expect(service.startResponse({ surveyId: "survey1" }, mockUser.id)).rejects.toThrow(
        "종료된 설문조사입니다.",
      );
    });
  });

  describe("completeResponse", () => {
    it("Response를 완료 처리한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", completedAt: null };
      const mockUpdatedResponse = { ...mockResponse, completedAt: now };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockResponseRepo.updateCompletedAt.mockResolvedValue(mockUpdatedResponse as never);

      // When
      const result = await service.completeResponse({ responseId: "response1" }, mockUser.id);

      // Then
      expect(result.completedAt).toBeTruthy();
      expect(mockResponseRepo.updateCompletedAt).toHaveBeenCalledWith("response1");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.completeResponse({ responseId: "invalid-response" }, mockUser.id),
      ).rejects.toThrow("응답을 찾을 수 없습니다.");
    });

    it("다른 사용자의 Response면 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(
        service.completeResponse({ responseId: "response1" }, mockUser.id),
      ).rejects.toThrow("완료 권한이 없습니다.");
    });

    it("이미 완료된 Response면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", completedAt: now };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(
        service.completeResponse({ responseId: "response1" }, mockUser.id),
      ).rejects.toThrow("이미 완료된 응답입니다.");
    });
  });

  describe("deleteResponse", () => {
    it("Response를 성공적으로 삭제한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockResponseRepo.delete.mockResolvedValue(mockResponse as never);

      // When
      await service.deleteResponse("response1", mockUser.id);

      // Then
      expect(mockResponseRepo.delete).toHaveBeenCalledWith("response1");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteResponse("invalid-response", mockUser.id)).rejects.toThrow(
        "응답을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 Response면 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(service.deleteResponse("response1", mockUser.id)).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );
    });
  });

  describe("verifyResponseOwnership", () => {
    it("소유자면 true를 반환한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.verifyResponseOwnership("response1", mockUser.id);

      // Then
      expect(result).toBe(true);
    });

    it("소유자가 아니면 false를 반환한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.verifyResponseOwnership("response1", mockUser.id);

      // Then
      expect(result).toBe(false);
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.verifyResponseOwnership("invalid-response", mockUser.id),
      ).rejects.toThrow("응답을 찾을 수 없습니다.");
    });
  });
});
