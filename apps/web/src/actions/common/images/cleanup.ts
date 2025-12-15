"use server";

import { fileUploadService } from "@/server/services/file-upload";
import type { CleanupOrphanFilesResponse } from "@/types/dto/image";

export async function cleanupOrphanFiles(): Promise<CleanupOrphanFilesResponse> {
  try {
    return await fileUploadService.cleanupOrphanFiles();
  } catch (error) {
    console.error("고아 파일 정리 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("고아 파일 정리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
