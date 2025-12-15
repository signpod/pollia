import type { FileUploadRepository } from "@/server/repositories/file-upload/fileUploadRepository";
import { FileStatus } from "@prisma/client";

import { FileUploadService, type SupabaseClient, type SupabaseClientFactory } from ".";

export function createMockStorageBucket() {
  return {
    createSignedUploadUrl: jest.fn(),
    getPublicUrl: jest.fn(),
    remove: jest.fn(),
  };
}

export type MockStorageBucket = ReturnType<typeof createMockStorageBucket>;

export function createFileUploadServiceTestContext() {
  const mockRepo = {
    findById: jest.fn(),
    findByIdAndUserId: jest.fn(),
    findByFilePathAndUserId: jest.fn(),
    findTemporaryByIdAndUserId: jest.fn(),
    findTemporaryOlderThan: jest.fn(),
    findUnreferencedOlderThan: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<FileUploadRepository>;

  const mockStorageBucket = createMockStorageBucket();

  const mockSupabaseClient = {
    storage: {
      from: jest.fn().mockReturnValue(mockStorageBucket),
    },
  } as unknown as jest.Mocked<SupabaseClient>;

  const mockCreateSupabase: jest.MockedFunction<SupabaseClientFactory> = jest
    .fn()
    .mockResolvedValue(mockSupabaseClient);

  const service = new FileUploadService(mockRepo, mockCreateSupabase);

  return {
    service,
    mockRepo,
    mockSupabaseClient,
    mockStorageBucket,
    mockCreateSupabase,
  };
}

export type FileUploadServiceTestContext = ReturnType<typeof createFileUploadServiceTestContext>;

export const mockFileUploadFactory = (
  overrides: Partial<{
    id: string;
    userId: string;
    originalFileName: string;
    filePath: string;
    publicUrl: string;
    fileSize: number;
    mimeType: string;
    bucket: string;
    status: FileStatus;
    confirmedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
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
  updatedAt: new Date(),
  ...overrides,
});
