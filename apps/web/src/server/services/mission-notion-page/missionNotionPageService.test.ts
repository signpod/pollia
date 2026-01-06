import {
  type MissionNotionPageServiceTestContext,
  createMissionNotionPageServiceTestContext,
  createMockMissionNotionPage,
} from "./testUtils";

const TEST_MISSION_ID = "mission1";

describe("MissionNotionPageService", () => {
  let context: MissionNotionPageServiceTestContext;
  let service: MissionNotionPageServiceTestContext["service"];
  let mockRepo: MissionNotionPageServiceTestContext["mockRepository"];

  beforeEach(() => {
    context = createMissionNotionPageServiceTestContext();
    service = context.service;
    mockRepo = context.mockRepository;
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
