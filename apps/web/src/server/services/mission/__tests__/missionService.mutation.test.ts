import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from "..";
import { createMockMission } from "../../testUtils";

jest.mock("@/lib/crypto", () => ({
  encrypt: jest.fn((text: string) => `encrypted:${text}`),
  decrypt: jest.fn((text: string) => text.replace("encrypted:", "")),
}));

describe("MissionService - Mutation", () => {
  let missionService: MissionService;
  let mockRepository: jest.Mocked<MissionRepository>;
  let mockResponseRepository: jest.Mocked<MissionResponseRepository>;
  let mockActionRepository: jest.Mocked<ActionRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      createWithActions: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      duplicateMission: jest.fn(),
    } as jest.Mocked<MissionRepository>;

    mockResponseRepository = {
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
    } as jest.Mocked<MissionResponseRepository>;

    mockActionRepository = {
      findById: jest.fn(),
      findByIdWithOptions: jest.fn(),
      findActionIdsByMissionId: jest.fn(),
      findDetailsByMissionId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMultipleChoice: jest.fn(),
      update: jest.fn(),
      updateWithOptions: jest.fn(),
      delete: jest.fn(),
      updateManyOrders: jest.fn(),
    } as jest.Mocked<ActionRepository>;

    missionService = new MissionService(
      mockRepository,
      mockResponseRepository,
      mockActionRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateMission", () => {
    it("Mission을 성공적으로 수정한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        title: "기존 설문",
        creatorId: "user-1",
      });
      const mockUpdatedMission = {
        ...mockMission,
        title: "수정된 설문",
        description: "수정된 설명",
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.update.mockResolvedValue(mockUpdatedMission);

      // When
      const result = await missionService.updateMission(
        "mission-1",
        { title: "수정된 설문", description: "수정된 설명" },
        "user-1",
      );

      // Then
      expect(result.title).toBe("수정된 설문");
      expect(result.description).toBe("수정된 설명");
      expect(mockRepository.update).toHaveBeenCalledWith(
        "mission-1",
        {
          title: "수정된 설문",
          description: "수정된 설명",
          maxParticipants: null,
        },
        "user-1",
      );
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        missionService.updateMission("invalid-id", { title: "수정" }, "user-1"),
      ).rejects.toThrow("미션을 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(
        missionService.updateMission("mission-1", { title: "수정" }, "user-2"),
      ).rejects.toThrow("수정 권한이 없습니다.");

      try {
        await missionService.updateMission("mission-1", { title: "수정" }, "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });

    it("빈 제목으로 수정하면 400 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(
        missionService.updateMission("mission-1", { title: "" }, "user-1"),
      ).rejects.toThrow("제목을 입력해주세요.");

      try {
        await missionService.updateMission("mission-1", { title: "" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("deleteMission", () => {
    it("Mission을 성공적으로 삭제한다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.delete.mockResolvedValue(mockMission);

      // When
      await missionService.deleteMission("mission-1", "user-1");

      // Then
      expect(mockRepository.delete).toHaveBeenCalledWith("mission-1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.deleteMission("invalid-id", "user-1")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.deleteMission("mission-1", "user-2")).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );

      try {
        await missionService.deleteMission("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });

  describe("setPassword", () => {
    it("비밀번호를 성공적으로 설정한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.update.mockResolvedValue({
        ...mockMission,
        password: "encrypted:876098",
      });

      // When
      await missionService.setPassword("mission-1", "876098", "user-1");

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith("mission-1", {
        password: "encrypted:876098",
      });
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.setPassword("mission-1", "876098", "user-2")).rejects.toThrow(
        "비밀번호 설정 권한이 없습니다.",
      );

      try {
        await missionService.setPassword("mission-1", "876098", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });

    it("빈 비밀번호면 400 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.setPassword("mission-1", "", "user-1")).rejects.toThrow(
        "비밀번호는 정확히 6자리여야 합니다.",
      );

      try {
        await missionService.setPassword("mission-1", "", "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("removePassword", () => {
    it("비밀번호를 성공적으로 제거한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.update.mockResolvedValue({ ...mockMission, password: null });

      // When
      await missionService.removePassword("mission-1", "user-1");

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith("mission-1", { password: null });
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.removePassword("mission-1", "user-2")).rejects.toThrow(
        "비밀번호 제거 권한이 없습니다.",
      );

      try {
        await missionService.removePassword("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });

  describe("getPassword", () => {
    it("비밀번호를 복호화하여 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.getPassword("mission-1", "user-1");

      // Then
      expect(result).toBe("1234");
    });

    it("비밀번호가 없으면 null을 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.getPassword("mission-1", "user-1");

      // Then
      expect(result).toBeNull();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.getPassword("mission-1", "user-2")).rejects.toThrow(
        "비밀번호 조회 권한이 없습니다.",
      );

      try {
        await missionService.getPassword("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });

  describe("verifyPassword", () => {
    it("올바른 비밀번호면 true를 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.verifyPassword("mission-1", "1234");

      // Then
      expect(result).toBe(true);
    });

    it("틀린 비밀번호면 false를 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.verifyPassword("mission-1", "wrong");

      // Then
      expect(result).toBe(false);
    });

    it("비밀번호가 없는 미션은 항상 true를 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.verifyPassword("mission-1", "anything");

      // Then
      expect(result).toBe(true);
    });
  });
});
