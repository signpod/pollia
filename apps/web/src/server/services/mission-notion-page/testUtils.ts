import type { MissionNotionPageRepository } from "@/server/repositories/mission-notion-page/missionNotionPageRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import type { Mission, MissionNotionPage } from "@prisma/client";
import { MissionNotionPageService } from "./index";

export function createMissionNotionPageServiceTestContext() {
  const mockRepository = {
    findByMissionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<MissionNotionPageRepository>;

  const mockMissionRepository = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<MissionRepository>;

  const service = new MissionNotionPageService(mockRepository, mockMissionRepository);

  return { service, mockRepository, mockMissionRepository };
}

export const createMockMission = (overrides: Partial<Mission> = {}): Mission => ({
  id: "mission1",
  title: "테스트 미션",
  description: null,
  target: null,
  imageUrl: null,
  imageFileUploadId: null,
  brandLogoUrl: null,
  brandLogoFileUploadId: null,
  deadline: null,
  estimatedMinutes: null,
  maxParticipants: null,
  isActive: true,
  type: "GENERAL",
  category: "EVENT",
  password: null,
  creatorId: "user1",
  rewardId: null,
  eventId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export type MissionNotionPageServiceTestContext = ReturnType<
  typeof createMissionNotionPageServiceTestContext
>;

export const createMockMissionNotionPage = (
  overrides: Partial<MissionNotionPage> = {},
): MissionNotionPage => ({
  id: "notion-page-1",
  missionId: "mission1",
  notionPageId: "notion-123",
  notionPageUrl: "https://notion.so/notion123",
  lastSyncedAt: new Date(),
  syncedResponseCount: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
