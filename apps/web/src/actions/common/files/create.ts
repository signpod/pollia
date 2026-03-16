"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { fileUploadService } from "@/server/services/file-upload";
import type { UploadFileRequest, UploadFileResponse } from "@/types/dto/file";

export async function getUploadUrl(request: UploadFileRequest): Promise<UploadFileResponse> {
  try {
    const { user } = await requireContentManager();

    const result = await fileUploadService.createUploadUrl(
      {
        fileName: request.fileName,
        fileSize: request.fileSize,
        fileType: request.fileType,
        bucket: request.bucket,
        actionType: request.actionType,
      },
      user.id,
    );

    return { data: result };
  } catch (error) {
    return handleActionError(error, "파일 업로드 URL 생성 중 오류가 발생했습니다.");
  }
}
