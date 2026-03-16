"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { fileUploadService } from "@/server/services/file-upload";
import type { CleanupOrphanFilesResponse } from "@/types/dto/file";

export async function cleanupOrphanFiles(): Promise<CleanupOrphanFilesResponse> {
  try {
    await requireAdmin();
    return await fileUploadService.cleanupOrphanFiles();
  } catch (error) {
    return handleActionError(error, "고아 파일 정리 중 오류가 발생했습니다.");
  }
}
