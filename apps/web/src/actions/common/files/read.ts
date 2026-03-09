"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { fileUploadService } from "@/server/services/file-upload";
import type { FileUpload } from "@prisma/client";

export async function getFileUploadById(fileUploadId: string): Promise<FileUpload> {
  try {
    const user = await requireActiveUser();
    return await fileUploadService.getFileUpload(fileUploadId, user.id);
  } catch (error) {
    return handleActionError(error, "파일 업로드 조회 중 오류가 발생했습니다.");
  }
}
