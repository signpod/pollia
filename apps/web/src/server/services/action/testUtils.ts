import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionCompletionRepository } from "@/server/repositories/mission-completion/missionCompletionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { ActionService } from ".";

export {
  createMockAction,
  createMockActionOption,
  createMockActionResponse,
  createMockActionWithOptions,
  createMockMission,
  createMockMissionCompletion,
  expectServiceErrorWithCause,
} from "../testUtils";

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
    findOrdersByMissionId: jest.fn(),
    updateOrder: jest.fn(),
    updateManyOrders: jest.fn(),
  } as unknown as jest.Mocked<ActionRepository>;

  const mockMissionRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<MissionRepository>;

  const mockCompletionRepo = {
    findById: jest.fn(),
    findByMissionId: jest.fn(),
    findAllByMissionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<MissionCompletionRepository>;

  const service = new ActionService(mockActionRepo, mockMissionRepo, mockCompletionRepo);

  return { service, mockActionRepo, mockMissionRepo, mockCompletionRepo };
}

export type ActionServiceTestContext = ReturnType<typeof createActionServiceTestContext>;
