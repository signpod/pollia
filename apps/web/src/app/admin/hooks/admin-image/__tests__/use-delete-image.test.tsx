/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";

import { mockDeleteFileById, setupMocks } from "../testing/test-utils";
import { useDeleteImage } from "../use-delete-image";

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

describe("useDeleteImage", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("일반 사용 테스트", () => {
    it("초기 상태는 markedId가 null이고 isDeleting이 false이다", () => {
      // Given & When
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.markedId).toBeNull();
      expect(result.current.isDeleting).toBe(false);
    });

    it("mark 호출 시 markedId가 설정된다", () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.mark("file-upload-id-123");
      });

      // Then
      expect(result.current.markedId).toBe("file-upload-id-123");
    });

    it("unmark 호출 시 markedId가 null이 된다", () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mark("file-upload-id-123");
      });

      // When
      act(() => {
        result.current.unmark();
      });

      // Then
      expect(result.current.markedId).toBeNull();
    });

    it("deleteById 호출 시 해당 ID로 S3 삭제가 호출된다", async () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.deleteById("file-upload-id-456");
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({
          fileUploadId: "file-upload-id-456",
        });
      });
    });

    it("deleteMarked 호출 시 markedId로 S3 삭제가 호출되고 markedId가 null이 된다", async () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mark("file-upload-id-789");
      });

      // When
      act(() => {
        result.current.deleteMarked();
      });

      // Then
      await waitFor(() => {
        expect(mockDeleteFileById).toHaveBeenCalledWith({
          fileUploadId: "file-upload-id-789",
        });
      });

      expect(result.current.markedId).toBeNull();
    });
  });

  describe("경계값 테스트", () => {
    it("markedId가 없을 때 deleteMarked 호출해도 에러 없이 동작한다", () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.deleteMarked();
        });
      }).not.toThrow();

      expect(mockDeleteFileById).not.toHaveBeenCalled();
    });

    it("markedId가 없을 때 unmark 호출해도 에러 없이 동작한다", () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      // When & Then
      expect(() => {
        act(() => {
          result.current.unmark();
        });
      }).not.toThrow();

      expect(result.current.markedId).toBeNull();
    });

    it("mark 연속 호출 시 마지막 값으로 덮어쓴다", () => {
      // Given
      const { result } = renderHook(() => useDeleteImage(), {
        wrapper: createWrapper(),
      });

      // When
      act(() => {
        result.current.mark("first-id");
      });

      act(() => {
        result.current.mark("second-id");
      });

      // Then
      expect(result.current.markedId).toBe("second-id");
    });
  });
});
