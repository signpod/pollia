import { STORAGE_BUCKETS } from "@/constants/buckets";
import { FileStatus } from "@prisma/client";

import {
  type FileUploadServiceTestContext,
  createFileUploadServiceTestContext,
  mockFileUploadFactory,
} from "./testUtils";

describe("FileUploadService", () => {
  let ctx: FileUploadServiceTestContext;

  beforeEach(() => {
    ctx = createFileUploadServiceTestContext();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe("createUploadUrl", () => {
    const validInput = {
      fileName: "test.jpg",
      fileSize: 1024,
      fileType: "image/jpeg",
    };

    it("업로드 URL을 성공적으로 생성한다", async () => {
      // Given
      const mockFileUpload = mockFileUploadFactory({ id: "file1" });
      ctx.mockRepo.create.mockResolvedValue(mockFileUpload);

      ctx.mockStorageBucket.createSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: "https://signed-url.com" },
        error: null,
      });
      ctx.mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl: "https://public-url.com" },
      });

      // When
      const result = await ctx.service.createUploadUrl(validInput, "user1");

      // Then
      expect(result).toEqual({
        uploadUrl: "https://signed-url.com",
        publicUrl: "https://public-url.com",
        path: expect.stringMatching(/^user1\/\d+\.jpg$/),
        fileUploadId: "file1",
      });
      expect(ctx.mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user1",
          originalFileName: "test.jpg",
          status: FileStatus.TEMPORARY,
        }),
      );
    });

    it("지정된 bucket을 사용한다", async () => {
      // Given
      const inputWithBucket = { ...validInput, bucket: STORAGE_BUCKETS.MISSION_IMAGES };
      const mockFileUpload = mockFileUploadFactory();
      ctx.mockRepo.create.mockResolvedValue(mockFileUpload);

      ctx.mockStorageBucket.createSignedUploadUrl.mockResolvedValue({
        data: { signedUrl: "https://signed-url.com" },
        error: null,
      });
      ctx.mockStorageBucket.getPublicUrl.mockReturnValue({
        data: { publicUrl: "https://public-url.com" },
      });

      // When
      await ctx.service.createUploadUrl(inputWithBucket, "user1");

      // Then
      expect(ctx.mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        STORAGE_BUCKETS.MISSION_IMAGES,
      );
    });

    it("파일 크기가 10MB를 초과하면 400 에러를 던진다", async () => {
      // Given
      const largeFileInput = { ...validInput, fileSize: 11 * 1024 * 1024 };

      // When & Then
      await expect(ctx.service.createUploadUrl(largeFileInput, "user1")).rejects.toThrow(
        "파일 크기는 10MB를 초과할 수 없습니다.",
      );

      try {
        await ctx.service.createUploadUrl(largeFileInput, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }
    });

    it("지원하지 않는 파일 형식이면 400 에러를 던진다", async () => {
      // Given
      const invalidFileInput = { ...validInput, fileName: "test.pdf", fileType: "application/pdf" };

      // When & Then
      await expect(ctx.service.createUploadUrl(invalidFileInput, "user1")).rejects.toThrow(
        "지원하지 않는 파일 형식입니다.",
      );
    });

    it("파일명이 비어있으면 400 에러를 던진다", async () => {
      // Given
      const emptyFileNameInput = { ...validInput, fileName: "" };

      // When & Then
      await expect(ctx.service.createUploadUrl(emptyFileNameInput, "user1")).rejects.toThrow(
        "파일명이 필요합니다.",
      );
    });

    it("Supabase 업로드 URL 생성 실패 시 500 에러를 던진다", async () => {
      // Given
      ctx.mockStorageBucket.createSignedUploadUrl.mockResolvedValue({
        data: null,
        error: new Error("Storage error"),
      });

      // When & Then
      await expect(ctx.service.createUploadUrl(validInput, "user1")).rejects.toThrow(
        "업로드 URL 생성에 실패했습니다.",
      );

      try {
        await ctx.service.createUploadUrl(validInput, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(500);
      }
    });
  });

  describe("deleteFile", () => {
    it("파일을 성공적으로 삭제한다", async () => {
      // Given
      const mockFileUpload = mockFileUploadFactory();
      ctx.mockRepo.findByFilePathAndUserId.mockResolvedValue(mockFileUpload);
      ctx.mockStorageBucket.remove.mockResolvedValue({ error: null });

      // When
      await ctx.service.deleteFile(mockFileUpload.filePath, "user1");

      // Then
      expect(ctx.mockRepo.findByFilePathAndUserId).toHaveBeenCalledWith(
        mockFileUpload.filePath,
        "user1",
      );
      expect(ctx.mockStorageBucket.remove).toHaveBeenCalledWith([mockFileUpload.filePath]);
      expect(ctx.mockRepo.delete).toHaveBeenCalledWith(mockFileUpload.id);
    });

    it("파일을 찾을 수 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockRepo.findByFilePathAndUserId.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.deleteFile("invalid/path.jpg", "user1")).rejects.toThrow(
        "파일을 찾을 수 없거나 삭제 권한이 없습니다.",
      );

      try {
        await ctx.service.deleteFile("invalid/path.jpg", "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });

    it("Storage 삭제 실패 시 500 에러를 던진다", async () => {
      // Given
      const mockFileUpload = mockFileUploadFactory();
      ctx.mockRepo.findByFilePathAndUserId.mockResolvedValue(mockFileUpload);
      ctx.mockStorageBucket.remove.mockResolvedValue({ error: new Error("Delete error") });

      // When & Then
      await expect(ctx.service.deleteFile(mockFileUpload.filePath, "user1")).rejects.toThrow(
        "이미지 삭제에 실패했습니다.",
      );

      try {
        await ctx.service.deleteFile(mockFileUpload.filePath, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(500);
      }
    });
  });

  describe("confirmFile", () => {
    it("파일을 성공적으로 확정한다", async () => {
      // Given
      const mockFileUpload = mockFileUploadFactory({ status: FileStatus.TEMPORARY });
      ctx.mockRepo.findTemporaryByIdAndUserId.mockResolvedValue(mockFileUpload);

      // When
      await ctx.service.confirmFile("file1", "user1");

      // Then
      expect(ctx.mockRepo.findTemporaryByIdAndUserId).toHaveBeenCalledWith("file1", "user1");
      expect(ctx.mockRepo.updateStatus).toHaveBeenCalledWith(
        "file1",
        FileStatus.CONFIRMED,
        expect.any(Date),
      );
    });

    it("임시 파일을 찾을 수 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockRepo.findTemporaryByIdAndUserId.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.confirmFile("invalid-id", "user1")).rejects.toThrow(
        "임시 파일을 찾을 수 없거나 이미 처리되었습니다.",
      );

      try {
        await ctx.service.confirmFile("invalid-id", "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getFileUpload", () => {
    it("파일을 성공적으로 조회한다", async () => {
      // Given
      const mockFileUpload = mockFileUploadFactory();
      ctx.mockRepo.findByIdAndUserId.mockResolvedValue(mockFileUpload);

      // When
      const result = await ctx.service.getFileUpload("file1", "user1");

      // Then
      expect(result).toEqual(mockFileUpload);
      expect(ctx.mockRepo.findByIdAndUserId).toHaveBeenCalledWith("file1", "user1");
    });

    it("파일을 찾을 수 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockRepo.findByIdAndUserId.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.getFileUpload("invalid-id", "user1")).rejects.toThrow(
        "파일을 찾을 수 없습니다.",
      );

      try {
        await ctx.service.getFileUpload("invalid-id", "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("cleanupOrphanFiles", () => {
    it("TEMPORARY 고아 파일을 삭제한다", async () => {
      // Given
      const oldTemporaryFile = mockFileUploadFactory({
        id: "temp1",
        filePath: "user1/old-temp.jpg",
        status: FileStatus.TEMPORARY,
      });

      ctx.mockRepo.findTemporaryOlderThan.mockResolvedValue([oldTemporaryFile]);
      ctx.mockRepo.findUnreferencedOlderThan.mockResolvedValue([]);
      ctx.mockStorageBucket.remove.mockResolvedValue({ error: null });

      // When
      const result = await ctx.service.cleanupOrphanFiles();

      // Then
      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toContain(oldTemporaryFile.filePath);
      expect(ctx.mockRepo.delete).toHaveBeenCalledWith(oldTemporaryFile.id);
    });

    it("참조 없는 고아 파일을 삭제한다", async () => {
      // Given
      const unreferencedFile = mockFileUploadFactory({
        id: "unref1",
        filePath: "user1/unreferenced.jpg",
        status: FileStatus.CONFIRMED,
      });

      ctx.mockRepo.findTemporaryOlderThan.mockResolvedValue([]);
      ctx.mockRepo.findUnreferencedOlderThan.mockResolvedValue([unreferencedFile]);
      ctx.mockStorageBucket.remove.mockResolvedValue({ error: null });

      // When
      const result = await ctx.service.cleanupOrphanFiles();

      // Then
      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toContain(unreferencedFile.filePath);
    });

    it("Storage 삭제 실패 시 failedFiles에 추가한다", async () => {
      // Given
      const failedFile = mockFileUploadFactory({
        id: "fail1",
        filePath: "user1/failed.jpg",
      });

      ctx.mockRepo.findTemporaryOlderThan.mockResolvedValue([failedFile]);
      ctx.mockRepo.findUnreferencedOlderThan.mockResolvedValue([]);
      ctx.mockStorageBucket.remove.mockResolvedValue({ error: new Error("Delete error") });

      // When
      const result = await ctx.service.cleanupOrphanFiles();

      // Then
      expect(result.deletedCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.failedFiles).toContain(failedFile.filePath);
      expect(ctx.mockRepo.delete).not.toHaveBeenCalled();
    });
  });
});
