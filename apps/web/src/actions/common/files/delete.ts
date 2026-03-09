"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { fileUploadService } from "@/server/services/file-upload";
import type {
  DeleteFileByIdRequest,
  DeleteFileByIdResponse,
  DeleteFileRequest,
  DeleteFileResponse,
} from "@/types/dto/file";

export async function deleteFileByPath(request: DeleteFileRequest): Promise<DeleteFileResponse> {
  try {
    const user = await requireActiveUser();
    await fileUploadService.deleteFileByPath(request.path, user.id);
    return {};
  } catch (error) {
    return handleActionError(error, "파일 삭제 중 오류가 발생했습니다.");
  }
}

export async function deleteFileById(
  request: DeleteFileByIdRequest,
): Promise<DeleteFileByIdResponse> {
  try {
    const user = await requireActiveUser();
    await fileUploadService.deleteFileById(request.fileUploadId, user.id);
    return {};
  } catch (error) {
    return handleActionError(error, "파일 삭제 중 오류가 발생했습니다.");
  }
}
