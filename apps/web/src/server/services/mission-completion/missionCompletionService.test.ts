import {
  type MissionCompletionServiceTestContext,
  createMissionCompletionServiceTestContext,
  createMockMission,
  createMockMissionCompletion,
} from "./testUtils";

const TEST_USER_ID = "user1";
const TEST_MISSION_ID = "mission1";

describe("MissionCompletionService", () => {
  let context: MissionCompletionServiceTestContext;
  let service: MissionCompletionServiceTestContext["service"];
  let mockRepo: MissionCompletionServiceTestContext["mockRepository"];
  let mockMissionRepo: MissionCompletionServiceTestContext["mockMissionRepository"];

  beforeEach(() => {
    context = createMissionCompletionServiceTestContext();
    service = context.service;
    mockRepo = context.mockRepository;
    mockMissionRepo = context.mockMissionRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMissionCompletion", () => {
    it("MissionCompletion을 성공적으로 조회한다", async () => {
      // Given
      const mockCompletion = createMockMissionCompletion({
        imageUrl: "https://example.com/image.jpg",
      });
      mockRepo.findByMissionId.mockResolvedValue(mockCompletion);

      // When
      const result = await service.getMissionCompletion(TEST_MISSION_ID);

      // Then
      expect(result).toEqual(mockCompletion);
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.findByMissionId).toHaveBeenCalledTimes(1);
    });

    it("MissionCompletion이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findByMissionId.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionCompletion("invalid-id")).rejects.toThrow(
        "미션 완료 데이터를 찾을 수 없습니다.",
      );

      try {
        await service.getMissionCompletion("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("createMissionCompletion", () => {
    it("MissionCompletion을 성공적으로 생성한다", async () => {
      // Given
      const createData = {
        title: "미션 완료!",
        description: "축하합니다!",
        imageUrl: "https://example.com/image.jpg",
        missionId: TEST_MISSION_ID,
      };
      const mockMission = createMockMission();
      const mockCreatedCompletion = createMockMissionCompletion({
        ...createData,
      });

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.create.mockResolvedValue(mockCreatedCompletion);

      // When
      const result = await service.createMissionCompletion(createData, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockCreatedCompletion);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.create).toHaveBeenCalledWith(createData, TEST_USER_ID);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const createData = {
        title: "미션 완료!",
        description: "축하합니다!",
        missionId: "invalid-mission",
      };
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.createMissionCompletion(createData, TEST_USER_ID)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      try {
        await service.createMissionCompletion(createData, TEST_USER_ID);
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("Mission 생성자가 아니면 403 에러를 던진다", async () => {
      // Given
      const createData = {
        title: "미션 완료!",
        description: "축하합니다!",
        missionId: TEST_MISSION_ID,
      };
      const mockMission = createMockMission({ creatorId: "other-user" });
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.createMissionCompletion(createData, TEST_USER_ID)).rejects.toThrow(
        "생성 권한이 없습니다.",
      );

      try {
        await service.createMissionCompletion(createData, TEST_USER_ID);
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        title: "",
        description: "축하합니다!",
        missionId: TEST_MISSION_ID,
      };
      const mockMission = createMockMission();

      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.createMissionCompletion(invalidData, TEST_USER_ID)).rejects.toThrow(
        "제목을 입력해주세요.",
      );

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("제목이 100자를 초과하면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        title: "a".repeat(101),
        description: "축하합니다!",
        missionId: TEST_MISSION_ID,
      };
      const mockMission = createMockMission();

      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.createMissionCompletion(invalidData, TEST_USER_ID)).rejects.toThrow();

      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("설명이 없으면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        title: "미션 완료!",
        description: "",
        missionId: TEST_MISSION_ID,
      };
      const mockMission = createMockMission();

      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.createMissionCompletion(invalidData, TEST_USER_ID)).rejects.toThrow(
        "설명을 입력해주세요.",
      );

      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("getCompletionsByMissionId", () => {
    it("빈 배열을 성공적으로 반환한다 (Completion이 없는 경우)", async () => {
      // Given
      const mockMission = createMockMission();
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.findAllByMissionId.mockResolvedValue([]);

      // When
      const result = await service.getCompletionsByMissionId(TEST_MISSION_ID);

      // Then
      expect(result).toEqual([]);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.findAllByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockMissionRepo.findById).toHaveBeenCalledTimes(1);
      expect(mockRepo.findAllByMissionId).toHaveBeenCalledTimes(1);
    });

    it("단일 Completion을 성공적으로 반환한다", async () => {
      // Given
      const mockMission = createMockMission();
      const mockCompletion = createMockMissionCompletion({
        title: "첫 번째 완료화면",
      });
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.findAllByMissionId.mockResolvedValue([mockCompletion]);

      // When
      const result = await service.getCompletionsByMissionId(TEST_MISSION_ID);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCompletion);
      expect(mockRepo.findAllByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
    });

    it("여러 Completion을 생성 시간 순서대로 반환한다", async () => {
      // Given
      const mockMission = createMockMission();
      const oldestCompletion = createMockMissionCompletion({
        id: "completion1",
        title: "첫 번째 완료화면",
        createdAt: new Date("2024-01-01"),
      });
      const middleCompletion = createMockMissionCompletion({
        id: "completion2",
        title: "두 번째 완료화면",
        createdAt: new Date("2024-01-02"),
      });
      const newestCompletion = createMockMissionCompletion({
        id: "completion3",
        title: "세 번째 완료화면",
        createdAt: new Date("2024-01-03"),
      });

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.findAllByMissionId.mockResolvedValue([
        oldestCompletion,
        middleCompletion,
        newestCompletion,
      ]);

      // When
      const result = await service.getCompletionsByMissionId(TEST_MISSION_ID);

      // Then
      expect(result).toHaveLength(3);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getCompletionsByMissionId("invalid-mission-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      try {
        await service.getCompletionsByMissionId("invalid-mission-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(mockRepo.findAllByMissionId).not.toHaveBeenCalled();
    });

    it("동일 Mission에 대한 여러 Completion이 모두 반환된다 (다중 엔딩)", async () => {
      // Given
      const mockMission = createMockMission();
      const happyEndingCompletion = createMockMissionCompletion({
        id: "happy-ending",
        title: "해피 엔딩",
        description: "축하합니다! 최고의 결과입니다.",
      });
      const normalEndingCompletion = createMockMissionCompletion({
        id: "normal-ending",
        title: "노말 엔딩",
        description: "미션을 완료했습니다.",
      });
      const badEndingCompletion = createMockMissionCompletion({
        id: "bad-ending",
        title: "배드 엔딩",
        description: "아쉽게 끝났습니다.",
      });

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.findAllByMissionId.mockResolvedValue([
        happyEndingCompletion,
        normalEndingCompletion,
        badEndingCompletion,
      ]);

      // When
      const result = await service.getCompletionsByMissionId(TEST_MISSION_ID);

      // Then
      expect(result).toHaveLength(3);
      expect(result.map(c => c.id)).toEqual(["happy-ending", "normal-ending", "bad-ending"]);
      expect(mockRepo.findAllByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.findAllByMissionId).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateMissionCompletion", () => {
    it("MissionCompletion을 성공적으로 수정한다", async () => {
      // Given
      const updateData = {
        title: "수정된 제목",
        description: "수정된 설명",
      };
      const mockCompletion = createMockMissionCompletion();
      const mockUpdatedCompletion = createMockMissionCompletion({
        ...updateData,
      });

      mockRepo.findById.mockResolvedValue(mockCompletion);
      mockRepo.update.mockResolvedValue(mockUpdatedCompletion);

      // When
      const result = await service.updateMissionCompletion(
        mockCompletion.id,
        updateData,
        TEST_USER_ID,
      );

      // Then
      expect(result).toEqual(mockUpdatedCompletion);
      expect(mockRepo.findById).toHaveBeenCalledWith(mockCompletion.id);
      expect(mockRepo.update).toHaveBeenCalledWith(mockCompletion.id, updateData, TEST_USER_ID);
    });

    it("MissionCompletion이 없으면 404 에러를 던진다", async () => {
      // Given
      const updateData = { title: "수정된 제목" };
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.updateMissionCompletion("invalid-id", updateData, TEST_USER_ID),
      ).rejects.toThrow("미션 완료 데이터를 찾을 수 없습니다.");

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("Mission 생성자가 아니면 403 에러를 던진다", async () => {
      // Given
      const updateData = { title: "수정된 제목" };
      const mockCompletion = createMockMissionCompletion({
        mission: {
          id: TEST_MISSION_ID,
          creatorId: "other-user",
        },
      });

      mockRepo.findById.mockResolvedValue(mockCompletion);

      // When & Then
      await expect(
        service.updateMissionCompletion(mockCompletion.id, updateData, TEST_USER_ID),
      ).rejects.toThrow("수정 권한이 없습니다.");

      try {
        await service.updateMissionCompletion(mockCompletion.id, updateData, TEST_USER_ID);
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("빈 객체로 수정하면 400 에러를 던진다", async () => {
      // Given
      const updateData = {};
      const mockCompletion = createMockMissionCompletion();

      mockRepo.findById.mockResolvedValue(mockCompletion);

      // When & Then
      await expect(
        service.updateMissionCompletion(mockCompletion.id, updateData, TEST_USER_ID),
      ).rejects.toThrow("최소 하나의 필드를 수정해야 합니다.");

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteMissionCompletion", () => {
    it("MissionCompletion을 성공적으로 삭제한다", async () => {
      // Given
      const mockCompletion = createMockMissionCompletion();

      mockRepo.findById.mockResolvedValue(mockCompletion);
      mockRepo.delete.mockResolvedValue(mockCompletion);

      // When
      await service.deleteMissionCompletion(mockCompletion.id, TEST_USER_ID);

      // Then
      expect(mockRepo.findById).toHaveBeenCalledWith(mockCompletion.id);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockCompletion.id);
    });

    it("MissionCompletion이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteMissionCompletion("invalid-id", TEST_USER_ID)).rejects.toThrow(
        "미션 완료 데이터를 찾을 수 없습니다.",
      );

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("Mission 생성자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockCompletion = createMockMissionCompletion({
        mission: {
          id: TEST_MISSION_ID,
          creatorId: "other-user",
        },
      });

      mockRepo.findById.mockResolvedValue(mockCompletion);

      // When & Then
      await expect(
        service.deleteMissionCompletion(mockCompletion.id, TEST_USER_ID),
      ).rejects.toThrow("삭제 권한이 없습니다.");

      try {
        await service.deleteMissionCompletion(mockCompletion.id, TEST_USER_ID);
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
