import {
  type MissionNotionPageServiceTestContext,
  createMissionNotionPageServiceTestContext,
  createMockMission,
  createMockMissionNotionPage,
} from "./testUtils";

const TEST_MISSION_ID = "mission1";
const TEST_USER_ID = "user1";
const OTHER_USER_ID = "user2";

describe("MissionNotionPageService", () => {
  let context: MissionNotionPageServiceTestContext;
  let service: MissionNotionPageServiceTestContext["service"];
  let mockRepo: MissionNotionPageServiceTestContext["mockRepository"];
  let mockMissionRepo: MissionNotionPageServiceTestContext["mockMissionRepository"];

  beforeEach(() => {
    context = createMissionNotionPageServiceTestContext();
    service = context.service;
    mockRepo = context.mockRepository;
    mockMissionRepo = context.mockMissionRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getByMissionId", () => {
    it("MissionNotionPage를 성공적으로 조회한다", async () => {
      // Given
      const mockNotionPage = createMockMissionNotionPage();
      mockRepo.findByMissionId.mockResolvedValue(mockNotionPage);

      // When
      const result = await service.getByMissionId(TEST_MISSION_ID);

      // Then
      expect(result).toEqual(mockNotionPage);
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.findByMissionId).toHaveBeenCalledTimes(1);
    });

    it("MissionNotionPage가 없으면 null을 반환한다", async () => {
      // Given
      mockRepo.findByMissionId.mockResolvedValue(null);

      // When
      const result = await service.getByMissionId(TEST_MISSION_ID);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("getByMissionIdWithAuth", () => {
    it("권한이 있는 사용자가 MissionNotionPage를 성공적으로 조회한다", async () => {
      // Given
      const mockMission = createMockMission({ creatorId: TEST_USER_ID });
      const mockNotionPage = createMockMissionNotionPage();
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.findByMissionId.mockResolvedValue(mockNotionPage);

      // When
      const result = await service.getByMissionIdWithAuth(TEST_MISSION_ID, TEST_USER_ID);

      // Then
      expect(result).toEqual(mockNotionPage);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
    });

    it("미션이 존재하지 않으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getByMissionIdWithAuth(TEST_MISSION_ID, TEST_USER_ID)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
      expect(mockRepo.findByMissionId).not.toHaveBeenCalled();
    });

    it("권한이 없는 사용자가 조회하면 403 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({ creatorId: TEST_USER_ID });
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.getByMissionIdWithAuth(TEST_MISSION_ID, OTHER_USER_ID)).rejects.toThrow(
        "노션 리포트 조회 권한이 없습니다.",
      );
      expect(mockRepo.findByMissionId).not.toHaveBeenCalled();
    });

    it("권한이 있지만 MissionNotionPage가 없으면 null을 반환한다", async () => {
      // Given
      const mockMission = createMockMission({ creatorId: TEST_USER_ID });
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockRepo.findByMissionId.mockResolvedValue(null);

      // When
      const result = await service.getByMissionIdWithAuth(TEST_MISSION_ID, TEST_USER_ID);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("upsertNotionPage", () => {
    it("MissionNotionPage를 성공적으로 생성/수정한다", async () => {
      // Given
      const input = {
        notionPageId: "notion-456",
        notionPageUrl: "https://notion.so/notion456",
        syncedResponseCount: 25,
      };
      const mockUpsertedPage = createMockMissionNotionPage({
        ...input,
        missionId: TEST_MISSION_ID,
      });
      mockRepo.upsert.mockResolvedValue(mockUpsertedPage);

      // When
      const result = await service.upsertNotionPage(TEST_MISSION_ID, input);

      // Then
      expect(result).toEqual(mockUpsertedPage);
      expect(mockRepo.upsert).toHaveBeenCalledWith(TEST_MISSION_ID, {
        ...input,
        lastSyncedAt: expect.any(Date),
      });
      expect(mockRepo.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteByMissionId", () => {
    it("존재하는 MissionNotionPage를 삭제한다", async () => {
      // Given
      const mockNotionPage = createMockMissionNotionPage();
      mockRepo.findByMissionId.mockResolvedValue(mockNotionPage);
      mockRepo.delete.mockResolvedValue(mockNotionPage);

      // When
      await service.deleteByMissionId(TEST_MISSION_ID);

      // Then
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.delete).toHaveBeenCalledWith(TEST_MISSION_ID);
    });

    it("존재하지 않는 MissionNotionPage는 삭제하지 않는다", async () => {
      // Given
      mockRepo.findByMissionId.mockResolvedValue(null);

      // When
      await service.deleteByMissionId(TEST_MISSION_ID);

      // Then
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
