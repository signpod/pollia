"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";

export async function getFileUploadById(fileUploadId: string) {
  try {
    const user = await requireAuth();

    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        id: fileUploadId,
        userId: user.id,
      },
    });

    if (!fileUpload) {
      const error = new Error("파일을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return fileUpload;
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("파일 업로드 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
