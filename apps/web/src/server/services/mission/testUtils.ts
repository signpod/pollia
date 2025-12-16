import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import type { Mission } from "@prisma/client";
import { MissionService } from ".";

export function createMissionServiceTestContext() {
  const mockRepository = {
    findById: jest.fn(),
    findActionIdsByMissionId: jest.fn(),
    findActionById: jest.fn(),
    findActionsByMissionId: jest.fn(),
    findByUserId: jest.fn(),
    createWithActions: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updatePassword: jest.fn(),
    duplicateMission: jest.fn(),
  } as jest.Mocked<MissionRepository>;

  const service = new MissionService(mockRepository);

  return { service, mockRepository };
}

export type MissionServiceTestContext = ReturnType<typeof createMissionServiceTestContext>;

export const createMockMission = (overrides: Partial<Mission> = {}): Mission => ({
  id: "mission-1",
  title: "테스트 미션",
  description: null,
  target: null,
  imageUrl: null,
  brandLogoUrl: null,
  estimatedMinutes: null,
  deadline: null,
  isActive: true,
  type: "GENERAL",
  password: null,
  creatorId: "user-1",
  rewardId: null,
  imageFileUploadId: null,
  brandLogoFileUploadId: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});
