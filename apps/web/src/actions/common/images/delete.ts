"use server";

import { requireAuth } from "@/actions/common/auth";
import { fileUploadService } from "@/server/services/file-upload";
import type { DeleteImageRequest, DeleteImageResponse } from "@/types/dto/image";

export async function deleteImage(request: DeleteImageRequest): Promise<DeleteImageResponse> {
  try {
    const user = await requireAuth();
    await fileUploadService.deleteFile(request.path, user.id);
    return {};
  } catch (error) {
    console.error("이미지 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("이미지 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
