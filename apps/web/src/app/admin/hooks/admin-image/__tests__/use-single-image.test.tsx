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
  mockUploadFileToStorage,
  setupMocks,
} from "../testing/test-utils";
import { useSingleImage } from "../use-single-image";

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

describe("useSingleImage", () => {
  beforeEach(() => {
    setupMocks();
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("초기 상태", () => {
    it("초깃값 없이 호출하면 previewUrl이 null이다", () => {
      // Given & When
      const { result } = renderHook(() => useSingleImage(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.uploadedData).toBeNull();
      expect(result.current.isUploading).toBe(false);
      expect(result.current.markedInitialId).toBeNull();
    });

    it("initialUrl이 있으면 previewUrl로 표시된다", () => {
      // Given & When
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
            initialFileUploadId: "initial-file-id",
          }),
        { wrapper: createWrapper() },
      );

      // Then
      expect(result.current.previewUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("업로드", () => {
    it("upload 호출 시 blob URL로 미리보기가 표시된다", () => {
      // Given
      const { result } = renderHook(() => useSingleImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile("test.jpg"));
      });

      // Then
      expect(result.current.previewUrl).toBe("blob:test-url");
      expect(result.current.isUploading).toBe(true);
    });

    it("업로드 성공 시 uploadedData가 설정된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({ data: mockData });
      mockUploadFileToStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSingleImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload(createMockFile("test.jpg"));
      });

      // Then
      await waitFor(() => {
        expect(result.current.uploadedData).not.toBeNull();
      });
      expect(result.current.previewUrl).toBe(mockData.publicUrl);
      expect(result.current.isUploading).toBe(false);
    });

    it("초깃값이 있는 상태에서 upload 시 초깃값이 마킹된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({ data: mockData });
      mockUploadFileToStorage.mockResolvedValue(undefined);

      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/old.jpg",
            initialFileUploadId: "old-file-id",
          }),
        { wrapper: createWrapper() },
      );

      // When
      act(() => {
        result.current.upload(createMockFile("new.jpg"));
      });

      // Then
      await waitFor(() => {
        expect(result.current.uploadedData).not.toBeNull();
      });
      expect(result.current.markedInitialId).toBe("old-file-id");
    });
  });

  describe("discard", () => {
    it("새로 업로드한 이미지를 discard하면 S3에서 삭제된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({ data: mockData });
      mockUploadFileToStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSingleImage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.upload(createMockFile("test.jpg"));
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

    it("초깃값만 있는 상태에서 discard하면 마킹만 된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
            initialFileUploadId: "initial-file-id",
          }),
        { wrapper: createWrapper() },
      );

      // When
      act(() => {
        result.current.discard();
      });

      // Then
      expect(mockDeleteFileById).not.toHaveBeenCalled();
      expect(result.current.markedInitialId).toBe("initial-file-id");
      expect(result.current.previewUrl).toBeNull();
    });
  });

  describe("초기 이미지 마킹", () => {
    it("markInitialForDeletion 호출 시 markedInitialId가 설정된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
            initialFileUploadId: "initial-file-id",
          }),
        { wrapper: createWrapper() },
      );

      // When
      act(() => {
        result.current.markInitialForDeletion();
      });

      // Then
      expect(result.current.markedInitialId).toBe("initial-file-id");
    });

    it("unmarkInitial 호출 시 마킹이 해제된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
            initialFileUploadId: "initial-file-id",
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.markInitialForDeletion();
      });

      // When
      act(() => {
        result.current.unmarkInitial();
      });

      // Then
      expect(result.current.markedInitialId).toBeNull();
    });

    it("deleteMarkedInitial 호출 시 마킹된 초깃값이 삭제된다", async () => {
      // Given
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
            initialFileUploadId: "initial-file-id",
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.markInitialForDeletion();
      });

      // When
      act(() => {
        result.current.deleteMarkedInitial();
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({
          fileUploadId: "initial-file-id",
        });
      });
    });
  });

  describe("reset", () => {
    it("reset 호출 시 새로 업로드한 파일이 삭제되고 초깃값으로 복원된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({ data: mockData });
      mockUploadFileToStorage.mockResolvedValue(undefined);

      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/old.jpg",
            initialFileUploadId: "old-file-id",
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.upload(createMockFile("new.jpg"));
      });

      await waitFor(() => {
        expect(result.current.uploadedData).not.toBeNull();
      });

      // When
      act(() => {
        result.current.reset();
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({
          fileUploadId: mockData.fileUploadId,
        });
      });
      expect(result.current.previewUrl).toBe("https://example.com/old.jpg");
      expect(result.current.markedInitialId).toBeNull();
      expect(result.current.uploadedData).toBeNull();
    });

    it("reset 호출 시 마킹된 초깃값도 해제된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
            initialFileUploadId: "initial-file-id",
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.markInitialForDeletion();
      });

      // When
      act(() => {
        result.current.reset();
      });

      // Then
      expect(result.current.markedInitialId).toBeNull();
      expect(result.current.previewUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("경계값 테스트", () => {
    it("initialFileUploadId 없이 초깃값만 있을 때 discard해도 에러 없이 동작한다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useSingleImage({
            initialUrl: "https://example.com/image.jpg",
          }),
        { wrapper: createWrapper() },
      );

      // When & Then
      expect(() => {
        act(() => {
          result.current.discard();
        });
      }).not.toThrow();
      expect(result.current.previewUrl).toBeNull();
    });

    it("마킹된 것이 없을 때 deleteMarkedInitial 호출해도 에러 없이 동작한다", () => {
      // Given
      const { result } = renderHook(() => useSingleImage(), {
        wrapper: createWrapper(),
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.deleteMarkedInitial();
        });
      }).not.toThrow();
      expect(mockDeleteFileById).not.toHaveBeenCalled();
    });
  });
});
