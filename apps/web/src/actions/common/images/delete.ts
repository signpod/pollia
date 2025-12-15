"use server";

import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { DeleteImageRequest, DeleteImageResponse } from "@/types/dto/image";

export async function deleteImage(request: DeleteImageRequest): Promise<DeleteImageResponse> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const fileUpload = await prisma.fileUpload.findFirst({
      where: {
        filePath: request.path,
        userId: user.id,
      },
    });

    if (!fileUpload) {
      const error = new Error("파일을 찾을 수 없거나 삭제 권한이 없습니다.");
      error.cause = 404;
      throw error;
    }

    const { error: deleteError } = await supabase.storage
      .from(fileUpload.bucket)
      .remove([request.path]);

    if (deleteError) {
      console.error("이미지 삭제 실패:", deleteError);
      const error = new Error("이미지 삭제에 실패했습니다.");
      error.cause = 500;
      throw error;
    }

    await prisma.fileUpload.delete({
      where: { id: fileUpload.id },
    });

    return {};
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("이미지 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
