/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";

import {
  createMockFile,
  createMockUploadedData,
  mockDeleteFileById,
  mockGetUploadUrl,
  setupMocks,
} from "../testing/test-utils";
import { useUploadImage } from "../use-upload-image";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockCreateObjectURL = jest.fn(() => "blob:test-url");
const mockRevokeObjectURL = jest.fn();

describe("useUploadImage", () => {
  beforeEach(() => {
    setupMocks();
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("일반 사용 테스트", () => {
    it("초기 상태는 previewUrl과 uploadedData가 null이고 isUploading이 false이다", () => {
      // Given & When
      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.uploadedData).toBeNull();
      expect(result.current.isUploading).toBe(false);
    });

    it("파일 업로드 시 previewUrl이 blob URL로 즉시 설정된다", async () => {
      // Given
      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });
      const file = createMockFile();

      // When
      act(() => {
        result.current.upload(file);
      });

      // Then
      expect(result.current.previewUrl).toBe("blob:test-url");
      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    });

    it("업로드 중 isUploading이 true이다", async () => {
      // Given
      mockGetUploadUrl.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile());
      });

      // Then
      expect(result.current.isUploading).toBe(true);
    });

    it("업로드 성공 시 uploadedData가 설정되고 previewUrl이 publicUrl로 변경된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({
        data: {
          uploadUrl: "https://storage.example.com/upload",
          publicUrl: mockData.publicUrl,
          path: mockData.path,
          fileUploadId: mockData.fileUploadId,
        },
      });

      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile());
      });

      // Then
      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
      });

      expect(result.current.uploadedData).toEqual(mockData);
      expect(result.current.previewUrl).toBe(mockData.publicUrl);
    });

    it("업로드 성공 시 onUploadSuccess 콜백이 호출된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({
        data: {
          uploadUrl: "https://storage.example.com/upload",
          publicUrl: mockData.publicUrl,
          path: mockData.path,
          fileUploadId: mockData.fileUploadId,
        },
      });

      const onUploadSuccess = jest.fn();
      const { result } = renderHook(() => useUploadImage({ onUploadSuccess }), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile());
      });

      // Then
      await waitFor(() => {
        expect(onUploadSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    it("discard 호출 시 S3 삭제가 호출되고 상태가 초기화된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({
        data: {
          uploadUrl: "https://storage.example.com/upload",
          publicUrl: mockData.publicUrl,
          path: mockData.path,
          fileUploadId: mockData.fileUploadId,
        },
      });

      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.upload(createMockFile());
      });

      await waitFor(() => {
        expect(result.current.uploadedData).not.toBeNull();
      });

      // When
      act(() => {
        result.current.discard();
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({
          fileUploadId: mockData.fileUploadId,
        });
      });

      expect(result.current.previewUrl).toBeNull();
      expect(result.current.uploadedData).toBeNull();
    });
  });

  describe("경계값 테스트", () => {
    it("uploadedData가 없을 때 discard 호출해도 에러 없이 동작한다", () => {
      // Given
      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.discard();
        });
      }).not.toThrow();

      expect(mockDeleteFileById).not.toHaveBeenCalled();
    });

    it("업로드 실패 시 onUploadError가 호출된다", async () => {
      // Given
      const error = new Error("Upload failed");
      mockGetUploadUrl.mockRejectedValue(error);

      const onUploadError = jest.fn();
      const { result } = renderHook(() => useUploadImage({ onUploadError }), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile());
      });

      // Then
      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(error);
      });
    });

    it("업로드 실패 시 previewUrl이 null로 초기화된다", async () => {
      // Given
      mockGetUploadUrl.mockRejectedValue(new Error("Upload failed"));

      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile());
      });

      // Then
      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
      });

      expect(result.current.previewUrl).toBeNull();
      expect(result.current.uploadedData).toBeNull();
    });

    it("연속 업로드 시 이전 blob URL이 해제된다", async () => {
      // Given
      const blobUrls = ["blob:first-url", "blob:second-url"];
      let callCount = 0;
      mockCreateObjectURL.mockImplementation(() => blobUrls[callCount++] ?? "blob:fallback");

      const { result } = renderHook(() => useUploadImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile("first.jpg"));
      });

      act(() => {
        result.current.upload(createMockFile("second.jpg"));
      });

      // Then
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:first-url");
      expect(result.current.previewUrl).toBe("blob:second-url");
    });
  });
});
