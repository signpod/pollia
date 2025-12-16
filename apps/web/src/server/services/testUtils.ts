import type { Action, FileUpload, Mission } from "@prisma/client";
import { FileStatus, MissionType } from "@prisma/client";

export const createMockMission = (overrides: Partial<Mission> = {}): Mission => ({
  id: "mission1",
  title: "미션",
  description: null,
  target: null,
  imageUrl: null,
  brandLogoUrl: null,
  estimatedMinutes: null,
  deadline: null,
  isActive: true,
  type: MissionType.GENERAL,
  password: null,
  creatorId: "user1",
  rewardId: null,
  imageFileUploadId: null,
  brandLogoFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAction = (overrides: Partial<Action> = {}): Action => ({
  id: "action1",
  missionId: "mission1",
  title: "액션",
  description: null,
  imageUrl: null,
  type: "MULTIPLE_CHOICE",
  order: 0,
  maxSelections: null,
  imageFileUploadId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockFileUpload = (overrides: Partial<FileUpload> = {}): FileUpload => ({
  id: "file1",
  userId: "user1",
  originalFileName: "test.jpg",
  filePath: "user1/123456789.jpg",
  publicUrl: "https://example.com/user1/123456789.jpg",
  fileSize: 1024,
  mimeType: "image/jpeg",
  bucket: "pollia-images",
  status: FileStatus.TEMPORARY,
  confirmedAt: null,
  createdAt: new Date(),
  ...overrides,
});
