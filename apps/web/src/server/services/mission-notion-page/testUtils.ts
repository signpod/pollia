import type { MissionNotionPageRepository } from "@/server/repositories/mission-notion-page/missionNotionPageRepository";
import type { MissionNotionPage } from "@prisma/client";
import { MissionNotionPageService } from "./index";

export function createMissionNotionPageServiceTestContext() {
  const mockRepository = {
    findByMissionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<MissionNotionPageRepository>;

  const service = new MissionNotionPageService(mockRepository);

  return { service, mockRepository };
}

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
