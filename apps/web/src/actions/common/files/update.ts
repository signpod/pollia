"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { fileUploadService } from "@/server/services/file-upload";
import type { ConfirmFileRequest, ConfirmFileResponse } from "@/types/dto/file";

export async function confirmFile(request: ConfirmFileRequest): Promise<ConfirmFileResponse> {
  try {
    const { user } = await requireContentManager();
    await fileUploadService.confirmFile(request.fileUploadId, user.id);
    return {};
  } catch (error) {
    return handleActionError(error, "파일 확정 중 오류가 발생했습니다.");
  }
}
