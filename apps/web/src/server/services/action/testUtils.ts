import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { ActionService } from ".";

export {
  createMockAction,
  createMockActionOption,
  createMockActionResponse,
  createMockActionWithOptions,
  createMockMission,
  expectServiceErrorWithCause,
} from "../testUtils";
export { createMockMission as mockMissionFactory } from "../testUtils";

export function createActionServiceTestContext() {
  const mockActionRepo = {
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
    deleteAndReindexMissionActionOrders: jest.fn(),
    updateManyOrders: jest.fn(),
  } as unknown as jest.Mocked<ActionRepository>;

  const mockMissionRepo = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<MissionRepository>;

  const service = new ActionService(mockActionRepo, mockMissionRepo);

  return { service, mockActionRepo, mockMissionRepo };
}

export type ActionServiceTestContext = ReturnType<typeof createActionServiceTestContext>;
