"use server";

import { requireActiveUser } from "@/actions/common/auth";
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
    console.error("파일 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
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
    console.error("파일 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
