import type { MissionCompletionRepository } from "@/server/repositories/mission-completion/missionCompletionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionCompletionService } from "./missionCompletionService";

export { createMockMission, createMockMissionCompletion } from "../testUtils";

export function createMissionCompletionServiceTestContext() {
  const mockRepository = {
    findById: jest.fn(),
    findByMissionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<MissionCompletionRepository>;

  const mockMissionRepository = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    findActionIdsByMissionId: jest.fn(),
    findActionById: jest.fn(),
    findActionsByMissionId: jest.fn(),
    createWithActions: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    duplicateMission: jest.fn(),
  } as jest.Mocked<MissionRepository>;

  const service = new MissionCompletionService(mockRepository, mockMissionRepository);

  return { service, mockRepository, mockMissionRepository };
}

export type MissionCompletionServiceTestContext = ReturnType<
  typeof createMissionCompletionServiceTestContext
>;
