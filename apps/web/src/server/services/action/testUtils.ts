import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import type { Mission } from "@prisma/client";
import { ActionService } from ".";

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
    delete: jest.fn(),
    updateManyOrders: jest.fn(),
  } as jest.Mocked<ActionRepository>;

  const mockMissionRepo = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<MissionRepository>;

  const service = new ActionService(mockActionRepo, mockMissionRepo);

  return { service, mockActionRepo, mockMissionRepo };
}

export type ActionServiceTestContext = ReturnType<typeof createActionServiceTestContext>;

export const mockMissionFactory = (overrides: Partial<Mission> = {}): Mission => ({
  id: "mission1",
  title: "미션",
  description: null,
  target: null,
  imageUrl: null,
  brandLogoUrl: null,
  estimatedMinutes: null,
  deadline: null,
  isActive: true,
  creatorId: "user1",
  rewardId: null,
  imageFileUploadId: null,
  brandLogoFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
