import type { UploadedImageData } from "../types";

export function createMockFile(name = "test.jpg", type = "image/jpeg", size = 1024): File {
  const blob = new Blob([""], { type });
  return new File([blob], name, { type });
}

export function createMockUploadedData(
  overrides: Partial<UploadedImageData> = {},
): UploadedImageData {
  return {
    publicUrl: "https://storage.example.com/test.jpg",
    fileUploadId: "file-upload-id-123",
    path: "user1/1234567890.jpg",
    ...overrides,
  };
}

export const mockGetUploadUrl = jest.fn();
export const mockDeleteFileById = jest.fn();
export const mockDeleteFileByPath = jest.fn();
export const mockUploadFileToStorage = jest.fn();

export function setupMocks() {
  jest.clearAllMocks();

  mockGetUploadUrl.mockResolvedValue({
    data: {
      uploadUrl: "https://storage.example.com/upload",
      publicUrl: "https://storage.example.com/test.jpg",
      path: "user1/1234567890.jpg",
      fileUploadId: "file-upload-id-123",
    },
  });

  mockDeleteFileById.mockResolvedValue({ success: true });
  mockDeleteFileByPath.mockResolvedValue({ success: true });
  mockUploadFileToStorage.mockResolvedValue(undefined);
}

jest.mock("@/actions/common/files", () => ({
  getUploadUrl: (...args: unknown[]) => mockGetUploadUrl(...args),
  deleteFileById: (...args: unknown[]) => mockDeleteFileById(...args),
  deleteFileByPath: (...args: unknown[]) => mockDeleteFileByPath(...args),
}));

jest.mock("../upload-file-to-storage", () => ({
  uploadFileToStorage: (...args: unknown[]) => mockUploadFileToStorage(...args),
}));
