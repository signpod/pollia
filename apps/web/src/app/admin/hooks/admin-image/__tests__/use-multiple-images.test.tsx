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
import { useMultipleImages } from "../use-multiple-images";

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

describe("useMultipleImages", () => {
  beforeEach(() => {
    setupMocks();
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("초기 상태", () => {
    it("초깃값 없이 호출하면 빈 상태이다", () => {
      // Given & When
      const { result } = renderHook(() => useMultipleImages(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.getPreviewUrl("any-id")).toBeUndefined();
      expect(result.current.getUploadedData("any-id")).toBeUndefined();
      expect(result.current.isAnyUploading).toBe(false);
      expect(result.current.markedInitialIds.size).toBe(0);
    });

    it("initialImages가 있으면 previewUrl로 표시된다", () => {
      // Given & When
      const { result } = renderHook(
        () =>
          useMultipleImages({
            initialImages: [
              { id: "img-1", url: "https://example.com/1.jpg", fileUploadId: "fid-1" },
              { id: "img-2", url: "https://example.com/2.jpg", fileUploadId: "fid-2" },
            ],
          }),
        { wrapper: createWrapper() },
      );

      // Then
      expect(result.current.getPreviewUrl("img-1")).toBe("https://example.com/1.jpg");
      expect(result.current.getPreviewUrl("img-2")).toBe("https://example.com/2.jpg");
    });
  });

  describe("업로드", () => {
    it("upload 호출 시 해당 id에 blob URL 미리보기가 표시된다", () => {
      // Given
      const { result } = renderHook(() => useMultipleImages(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload("new-img", createMockFile("test.jpg"));
      });

      // Then
      expect(result.current.getPreviewUrl("new-img")).toBe("blob:test-url");
    });

    it("업로드 성공 시 uploadedData가 설정된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({ data: mockData });
      mockUploadFileToStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMultipleImages(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.upload("new-img", createMockFile("test.jpg"));
      });

      // Then
      await waitFor(() => {
        expect(result.current.getUploadedData("new-img")).not.toBeUndefined();
      });
      expect(result.current.getPreviewUrl("new-img")).toBe(mockData.publicUrl);
      expect(result.current.isUploading("new-img")).toBe(false);
    });
  });

  describe("discard", () => {
    it("새로 업로드한 이미지를 discard하면 S3에서 삭제된다", async () => {
      // Given
      const mockData = createMockUploadedData();
      mockGetUploadUrl.mockResolvedValue({ data: mockData });
      mockUploadFileToStorage.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMultipleImages(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.upload("new-img", createMockFile("test.jpg"));
      });

      await waitFor(() => {
        expect(result.current.getUploadedData("new-img")).not.toBeUndefined();
      });

      // When
      act(() => {
        result.current.discard("new-img");
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({
          fileUploadId: mockData.fileUploadId,
        });
      });
      expect(result.current.getPreviewUrl("new-img")).toBeUndefined();
    });

    it("초깃값을 discard하면 마킹만 된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useMultipleImages({
            initialImages: [
              { id: "img-1", url: "https://example.com/1.jpg", fileUploadId: "fid-1" },
            ],
          }),
        { wrapper: createWrapper() },
      );

      // When
      act(() => {
        result.current.discard("img-1");
      });

      // Then
      expect(mockDeleteFileById).not.toHaveBeenCalled();
      expect(result.current.markedInitialIds.has("fid-1")).toBe(true);
      expect(result.current.getPreviewUrl("img-1")).toBeUndefined();
    });
  });

  describe("초기 이미지 마킹", () => {
    it("markInitialForDeletion 호출 시 markedInitialIds에 추가된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useMultipleImages({
            initialImages: [
              { id: "img-1", url: "https://example.com/1.jpg", fileUploadId: "fid-1" },
            ],
          }),
        { wrapper: createWrapper() },
      );

      // When
      act(() => {
        result.current.markInitialForDeletion("fid-1");
      });

      // Then
      expect(result.current.markedInitialIds.has("fid-1")).toBe(true);
    });

    it("unmarkInitial 호출 시 마킹이 해제된다", () => {
      // Given
      const { result } = renderHook(
        () =>
          useMultipleImages({
            initialImages: [
              { id: "img-1", url: "https://example.com/1.jpg", fileUploadId: "fid-1" },
            ],
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.markInitialForDeletion("fid-1");
      });

      // When
      act(() => {
        result.current.unmarkInitial("fid-1");
      });

      // Then
      expect(result.current.markedInitialIds.has("fid-1")).toBe(false);
    });

    it("deleteAllMarkedInitials 호출 시 마킹된 모든 초깃값이 삭제된다", async () => {
      // Given
      const { result } = renderHook(
        () =>
          useMultipleImages({
            initialImages: [
              { id: "img-1", url: "https://example.com/1.jpg", fileUploadId: "fid-1" },
              { id: "img-2", url: "https://example.com/2.jpg", fileUploadId: "fid-2" },
            ],
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.markInitialForDeletion("fid-1");
        result.current.markInitialForDeletion("fid-2");
      });

      // When
      act(() => {
        result.current.deleteAllMarkedInitials();
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({ fileUploadId: "fid-1" });
      });
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({ fileUploadId: "fid-2" });
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
          useMultipleImages({
            initialImages: [
              { id: "img-1", url: "https://example.com/1.jpg", fileUploadId: "fid-1" },
            ],
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.upload("new-img", createMockFile("new.jpg"));
      });

      await waitFor(() => {
        expect(result.current.getUploadedData("new-img")).not.toBeUndefined();
      });

      act(() => {
        result.current.discard("img-1");
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
      expect(result.current.getPreviewUrl("img-1")).toBe("https://example.com/1.jpg");
      expect(result.current.getPreviewUrl("new-img")).toBeUndefined();
      expect(result.current.markedInitialIds.size).toBe(0);
    });
  });

  describe("경계값 테스트", () => {
    it("존재하지 않는 id로 isUploading 호출해도 false 반환", () => {
      // Given
      const { result } = renderHook(() => useMultipleImages(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.isUploading("non-existent")).toBe(false);
    });

    it("마킹된 것이 없을 때 deleteAllMarkedInitials 호출해도 에러 없이 동작한다", () => {
      // Given
      const { result } = renderHook(() => useMultipleImages(), {
        wrapper: createWrapper(),
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.deleteAllMarkedInitials();
        });
      }).not.toThrow();
      expect(mockDeleteFileById).not.toHaveBeenCalled();
    });
  });
});
