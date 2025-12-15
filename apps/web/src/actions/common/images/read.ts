"use server";

import { requireAuth } from "@/actions/common/auth";
import { fileUploadService } from "@/server/services/file-upload";

export async function getFileUploadById(fileUploadId: string) {
  try {
    const user = await requireAuth();
    return await fileUploadService.getFileUpload(fileUploadId, user.id);
  } catch (error) {
    console.error("파일 업로드 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 업로드 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
