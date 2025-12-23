import { FUNNEL_NODE_LABELS } from "@/server/services/tracking/constants";
import type { TrackingActionEntry, TrackingActionResponse } from "@prisma/client";
import {
  type TrackingActionServiceTestContext,
  createMockAction,
  createMockEntries,
  createMockMission,
  createMockResponses,
  createTrackingActionServiceTestContext,
} from "./testUtils";

const TEST_USER_ID = "user-123";
const TEST_MISSION_ID = "mission-123";
const TEST_ACTION_1_ID = "action-1";
const TEST_ACTION_2_ID = "action-2";

describe("TrackingActionService", () => {
  let context: TrackingActionServiceTestContext;

  beforeEach(() => {
    context = createTrackingActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMissionFunnel", () => {
    it("미션 생성자가 아니면 권한 에러를 발생시킨다", async () => {
      const mission = createMockMission({ id: TEST_MISSION_ID, creatorId: "other-user" });
      context.mockMissionRepo.findById.mockResolvedValue(mission);

      await expect(context.service.getMissionFunnel(TEST_MISSION_ID, TEST_USER_ID)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });

    it("미션이 없으면 404 에러를 발생시킨다", async () => {
      context.mockMissionRepo.findById.mockResolvedValue(null);

      await expect(context.service.getMissionFunnel(TEST_MISSION_ID, TEST_USER_ID)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("액션이 없으면 빈 퍼널 데이터를 반환한다", async () => {
      const mission = createMockMission({ id: TEST_MISSION_ID, creatorId: TEST_USER_ID });
      context.mockMissionRepo.findById.mockResolvedValue(mission);
      context.mockActionRepo.findDetailsByMissionId.mockResolvedValue([]);

      const result = await context.service.getMissionFunnel(TEST_MISSION_ID, TEST_USER_ID);

      expect(result).toEqual({
        nodes: [],
        links: [],
        metadata: {
          totalSessions: 0,
          totalStarted: 0,
          totalCompleted: 0,
          completionRate: 0,
          actions: [],
        },
      });
    });

    it("이탈 노드를 포함한 퍼널 데이터를 올바르게 생성한다", async () => {
      const mission = createMockMission({ id: TEST_MISSION_ID, creatorId: TEST_USER_ID });
      context.mockMissionRepo.findById.mockResolvedValue(mission);

      const actions = [
        createMockAction(TEST_ACTION_1_ID, "좋아하는 색상은?", 1, TEST_MISSION_ID),
        createMockAction(TEST_ACTION_2_ID, "선호하는 브랜드는?", 2, TEST_MISSION_ID),
      ];
      context.mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions);

      const entries = [
        ...createMockEntries(TEST_ACTION_1_ID, TEST_MISSION_ID, 90),
        ...createMockEntries(TEST_ACTION_2_ID, TEST_MISSION_ID, 80),
      ];
      context.mockEntryRepo.findByMissionId.mockResolvedValue(entries as TrackingActionEntry[]);

      const responses = [
        ...createMockResponses(TEST_ACTION_1_ID, TEST_MISSION_ID, 80),
        ...createMockResponses(TEST_ACTION_2_ID, TEST_MISSION_ID, 70),
      ];
      context.mockResponseRepo.findByMissionId.mockResolvedValue(
        responses as TrackingActionResponse[],
      );

      const result = await context.service.getMissionFunnel(TEST_MISSION_ID, TEST_USER_ID);

      expect(result.nodes).toHaveLength(7);

      const startNode = result.nodes.find(n => n.id === FUNNEL_NODE_LABELS.START);
      expect(startNode).toEqual({
        id: FUNNEL_NODE_LABELS.START,
        name: FUNNEL_NODE_LABELS.START,
        type: "start",
        count: 90,
      });

      const startToEntry1 = result.links.find(
        l => l.source === FUNNEL_NODE_LABELS.START && l.target === "1. 좋아하는 색상은?",
      );
      expect(startToEntry1?.value).toBe(90);

      const entry1ToResponse1 = result.links.find(
        l => l.source === "1. 좋아하는 색상은?" && l.target === "1. 좋아하는 색상은? 완료",
      );
      expect(entry1ToResponse1?.value).toBe(80);

      const entry1ToDrop = result.links.find(
        l => l.source === "1. 좋아하는 색상은?" && l.target === "1. 좋아하는 색상은? 이탈",
      );
      expect(entry1ToDrop?.value).toBe(10);

      expect(result.metadata.totalStarted).toBe(90);
      expect(result.metadata.totalCompleted).toBe(70);
      expect(result.metadata.completionRate).toBeCloseTo(77.78, 1);
    });

    it("완주율을 올바르게 계산한다", async () => {
      const mission = createMockMission({ id: TEST_MISSION_ID, creatorId: TEST_USER_ID });
      context.mockMissionRepo.findById.mockResolvedValue(mission);

      const actions = [
        createMockAction(TEST_ACTION_1_ID, "질문 1", 1, TEST_MISSION_ID),
        createMockAction(TEST_ACTION_2_ID, "질문 2", 2, TEST_MISSION_ID),
      ];
      context.mockActionRepo.findDetailsByMissionId.mockResolvedValue(actions);

      const entries = createMockEntries(TEST_ACTION_1_ID, TEST_MISSION_ID, 100);
      context.mockEntryRepo.findByMissionId.mockResolvedValue(entries as TrackingActionEntry[]);

      const responses = [
        ...createMockResponses(TEST_ACTION_1_ID, TEST_MISSION_ID, 60),
        ...createMockResponses(TEST_ACTION_2_ID, TEST_MISSION_ID, 60),
      ];
      context.mockResponseRepo.findByMissionId.mockResolvedValue(
        responses as TrackingActionResponse[],
      );

      const result = await context.service.getMissionFunnel(TEST_MISSION_ID, TEST_USER_ID);

      expect(result.metadata.totalStarted).toBe(100);
      expect(result.metadata.totalCompleted).toBe(60);
      expect(result.metadata.completionRate).toBe(60);
    });
  });
});
