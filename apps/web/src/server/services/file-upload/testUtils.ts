import type { FileUploadRepository } from "@/server/repositories/file-upload/fileUploadRepository";

import { FileUploadService, type SupabaseClient, type SupabaseClientFactory } from ".";

export { createMockFileUpload } from "../testUtils";
export { createMockFileUpload as mockFileUploadFactory } from "../testUtils";

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
