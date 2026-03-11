import type { MissionLikeRepository } from "@/server/repositories/mission-like/missionLikeRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { createMockMission, expectServiceErrorWithCause } from "../testUtils";
import { MissionLikeService } from "./missionLikeService";

jest.mock("@/database/utils/prisma/client", () => ({
  __esModule: true,
  default: {
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn({}),
  },
}));

describe("MissionLikeService", () => {
  let missionLikeService: MissionLikeService;
  let mockLikeRepo: jest.Mocked<MissionLikeRepository>;
  let mockMissionRepo: jest.Mocked<MissionRepository>;

  beforeEach(() => {
    mockLikeRepo = {
      findByMissionAndUser: jest.fn(),
      findManyByUserId: jest.fn(),
      create: jest.fn(),
      deleteByMissionAndUser: jest.fn(),
      countByMission: jest.fn(),
    } as jest.Mocked<MissionLikeRepository>;

    mockMissionRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      createWithActions: jest.fn(),
      updateLikesCount: jest.fn(),
      incrementViewCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      duplicateMission: jest.fn(),
    } as jest.Mocked<MissionRepository>;

    missionLikeService = new MissionLikeService(mockLikeRepo, mockMissionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("toggleLike", () => {
    it("미션이 없으면 404 에러를 던진다", async () => {
      mockMissionRepo.findById.mockResolvedValue(null);

      await expectServiceErrorWithCause(
        missionLikeService.toggleLike("invalid-id", "user-1"),
        "미션을 찾을 수 없습니다.",
        404,
      );
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("invalid-id");
    });

    it("좋아요가 없을 때 호출하면 좋아요를 추가하고 liked: true와 증가한 likesCount를 반환한다", async () => {
      const missionId = "mission-1";
      const userId = "user-1";
      const mockMission = createMockMission({ id: missionId, likesCount: 0 });
      const updatedMission = createMockMission({ id: missionId, likesCount: 1 });

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockLikeRepo.findByMissionAndUser.mockResolvedValue(null);
      mockLikeRepo.create.mockResolvedValue({} as never);
      mockMissionRepo.updateLikesCount.mockResolvedValue(updatedMission);

      const result = await missionLikeService.toggleLike(missionId, userId);

      expect(result).toEqual({ liked: true, likesCount: 1 });
      expect(mockLikeRepo.create).toHaveBeenCalledWith(missionId, userId, expect.anything());
      expect(mockMissionRepo.updateLikesCount).toHaveBeenCalledWith(
        missionId,
        1,
        expect.anything(),
      );
    });

    it("좋아요가 있을 때 호출하면 좋아요를 해제하고 liked: false와 감소한 likesCount를 반환한다", async () => {
      const missionId = "mission-1";
      const userId = "user-1";
      const mockMission = createMockMission({ id: missionId, likesCount: 1 });
      const updatedMission = createMockMission({ id: missionId, likesCount: 0 });
      const existingLike = { missionId, userId } as never;

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockLikeRepo.findByMissionAndUser.mockResolvedValue(existingLike);
      mockLikeRepo.deleteByMissionAndUser.mockResolvedValue({} as never);
      mockMissionRepo.updateLikesCount.mockResolvedValue(updatedMission);

      const result = await missionLikeService.toggleLike(missionId, userId);

      expect(result).toEqual({ liked: false, likesCount: 0 });
      expect(mockLikeRepo.deleteByMissionAndUser).toHaveBeenCalledWith(
        missionId,
        userId,
        expect.anything(),
      );
      expect(mockMissionRepo.updateLikesCount).toHaveBeenCalledWith(
        missionId,
        -1,
        expect.anything(),
      );
    });
  });

  describe("isLiked", () => {
    it("해당 미션에 좋아요가 있으면 true를 반환한다", async () => {
      mockLikeRepo.findByMissionAndUser.mockResolvedValue({
        missionId: "m1",
        userId: "u1",
      } as never);

      const result = await missionLikeService.isLiked("m1", "u1");

      expect(result).toBe(true);
      expect(mockLikeRepo.findByMissionAndUser).toHaveBeenCalledWith("m1", "u1");
    });

    it("해당 미션에 좋아요가 없으면 false를 반환한다", async () => {
      mockLikeRepo.findByMissionAndUser.mockResolvedValue(null);

      const result = await missionLikeService.isLiked("m1", "u1");

      expect(result).toBe(false);
      expect(mockLikeRepo.findByMissionAndUser).toHaveBeenCalledWith("m1", "u1");
    });
  });

  describe("getLikedMissions", () => {
    it("좋아요한 미션이 없으면 빈 배열을 반환한다", async () => {
      mockLikeRepo.findManyByUserId.mockResolvedValue([]);

      const result = await missionLikeService.getLikedMissions("user-1");

      expect(result).toEqual([]);
      expect(mockLikeRepo.findManyByUserId).toHaveBeenCalledWith("user-1");
    });

    it("좋아요한 미션이 있으면 해당 미션 배열을 createdAt desc 순으로 반환한다", async () => {
      const mockMission = createMockMission({ id: "mission-1", title: "미션1" });
      mockLikeRepo.findManyByUserId.mockResolvedValue([{ mission: mockMission }] as never);

      const result = await missionLikeService.getLikedMissions("user-1");

      expect(result).toEqual([mockMission]);
      expect(mockLikeRepo.findManyByUserId).toHaveBeenCalledWith("user-1");
    });
  });

  describe("getLikesCount", () => {
    it("미션이 없으면 0을 반환한다", async () => {
      mockMissionRepo.findById.mockResolvedValue(null);

      const result = await missionLikeService.getLikesCount("invalid-id");

      expect(result).toBe(0);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("invalid-id");
    });

    it("미션이 있으면 해당 미션의 likesCount를 반환한다", async () => {
      const mockMission = createMockMission({ id: "mission-1", likesCount: 5 });
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      const result = await missionLikeService.getLikesCount("mission-1");

      expect(result).toBe(5);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("mission-1");
    });
  });
});
