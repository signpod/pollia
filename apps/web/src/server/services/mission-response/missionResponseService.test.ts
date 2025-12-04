import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionResponseService } from ".";

describe("MissionResponseService", () => {
  let service: MissionResponseService;
  let mockResponseRepo: jest.Mocked<MissionResponseRepository>;
  let mockMissionRepo: jest.Mocked<MissionRepository>;

  const mockUser = { id: "user1" };
  const now = new Date();

  beforeEach(() => {
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

    mockMissionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MissionRepository>;

    service = new MissionResponseService(mockResponseRepo, mockMissionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getResponseById", () => {
    it("Response를 성공적으로 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", missionId: "mission1" };
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

  describe("getResponseByMissionAndUser", () => {
    it("Mission과 User로 Response를 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.getResponseByMissionAndUser("mission1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockResponseRepo.findByMissionAndUser).toHaveBeenCalledWith("mission1", mockUser.id);
    });

    it("Response가 없으면 null을 반환한다", async () => {
      // Given
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);

      // When
      const result = await service.getResponseByMissionAndUser("mission1", mockUser.id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("getUserResponses", () => {
    it("사용자의 모든 Response를 조회한다", async () => {
      // Given
      const mockResponses = [
        { id: "response1", missionId: "mission1" },
        { id: "response2", missionId: "mission2" },
      ];
      mockResponseRepo.findByUserId.mockResolvedValue(mockResponses as never);

      // When
      const result = await service.getUserResponses(mockUser.id);

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockResponseRepo.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("getMissionResponses", () => {
    it("Mission 소유자가 모든 Response를 조회한다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      const mockResponses = [{ id: "response1" }, { id: "response2" }];
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionId.mockResolvedValue(mockResponses as never);

      // When
      const result = await service.getMissionResponses("mission1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockResponseRepo.findByMissionId).toHaveBeenCalledWith("mission1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionResponses("invalid-mission", mockUser.id)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "other-user" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(service.getMissionResponses("mission1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getMissionStats", () => {
    it("Mission 통계를 성공적으로 조회한다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.countByMissionId.mockResolvedValue(10);
      mockResponseRepo.countCompletedByMissionId.mockResolvedValue(7);

      // When
      const result = await service.getMissionStats("mission1", mockUser.id);

      // Then
      expect(result).toEqual({
        total: 10,
        completed: 7,
        completionRate: 70,
      });
    });

    it("응답이 없으면 completionRate는 0이다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.countByMissionId.mockResolvedValue(0);
      mockResponseRepo.countCompletedByMissionId.mockResolvedValue(0);

      // When
      const result = await service.getMissionStats("mission1", mockUser.id);

      // Then
      expect(result.completionRate).toBe(0);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionStats("invalid-mission", mockUser.id)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "other-user" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(service.getMissionStats("mission1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("startResponse", () => {
    it("새 Response를 생성한다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true };
      const mockCreatedResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);
      mockResponseRepo.create.mockResolvedValue(mockCreatedResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockCreatedResponse);
      expect(mockResponseRepo.create).toHaveBeenCalledWith({
        missionId: "mission1",
        userId: mockUser.id,
      });
    });

    it("이미 응답이 있으면 기존 Response를 반환한다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true };
      const mockExistingResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(mockExistingResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockExistingResponse);
      expect(mockResponseRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.startResponse({ missionId: "invalid-mission" }, mockUser.id),
      ).rejects.toThrow("미션을 찾을 수 없습니다.");
    });

    it("종료된 Mission이면 400 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: false };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(service.startResponse({ missionId: "mission1" }, mockUser.id)).rejects.toThrow(
        "종료된 미션입니다.",
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
