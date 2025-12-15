"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { ConfirmFileRequest, ConfirmFileResponse } from "@/types/dto/image";
import { FileStatus } from "@prisma/client";

export async function confirmFile(request: ConfirmFileRequest): Promise<ConfirmFileResponse> {
  try {
    const user = await requireAuth();

    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        id: request.fileUploadId,
        userId: user.id,
        status: FileStatus.TEMPORARY,
      },
    });

    if (!fileUpload) {
      const error = new Error("임시 파일을 찾을 수 없거나 이미 처리되었습니다.");
      error.cause = 404;
      throw error;
    }

    await prisma.fileUpload.update({
      where: { id: request.fileUploadId },
      data: {
        status: FileStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });

    return {};
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 확정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
