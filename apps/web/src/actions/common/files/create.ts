"use server";

import { requireAuth } from "@/actions/common/auth";
import { fileUploadService } from "@/server/services/file-upload";
import type { UploadFileRequest, UploadFileResponse } from "@/types/dto/file";

export async function getUploadUrl(request: UploadFileRequest): Promise<UploadFileResponse> {
  try {
    const user = await requireAuth();

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
    console.error("파일 업로드 URL 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 업로드 URL 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
