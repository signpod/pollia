"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { fileUploadService } from "@/server/services/file-upload";
import type { ConfirmFileRequest, ConfirmFileResponse } from "@/types/dto/file";

export async function confirmFile(request: ConfirmFileRequest): Promise<ConfirmFileResponse> {
  try {
    const user = await requireActiveUser();
    await fileUploadService.confirmFile(request.fileUploadId, user.id);
    return {};
  } catch (error) {
    console.error("파일 확정 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 확정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
