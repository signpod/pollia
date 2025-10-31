"use server";

import { FileStatus } from "@prisma/client";
import { requireAuth } from "@/actions/common/auth";
import prisma from "@/database/utils/prisma/client";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import {
  CleanupOrphanFilesResponse,
  ConfirmFileRequest,
  ConfirmFileResponse,
  DeleteImageRequest,
  DeleteImageResponse,
  UploadImageRequest,
  UploadImageResponse,
} from "@/types/dto/image";

export async function getUploadUrl(request: UploadImageRequest): Promise<UploadImageResponse> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const validationError = validateUploadRequest(request);
    if (validationError) {
      const error = new Error(validationError);
      error.cause = 400;
      throw error;
    }

    const bucket = request.bucket || "pollia-images";
    const fileExtension = request.fileName.split(".").pop() || "";
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(fileName);

    if (uploadError) {
      console.error("❌ Upload URL 생성 실패:", uploadError);
      const error = new Error("업로드 URL 생성에 실패했습니다.");
      error.cause = 500;
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

    const fileUpload = await prisma.fileUpload.create({
      data: {
        userId: user.id,
        originalFileName: request.fileName,
        filePath: fileName,
        publicUrl: publicUrlData.publicUrl,
        fileSize: request.fileSize,
        mimeType: request.fileType,
        bucket,
        status: FileStatus.TEMPORARY,
      },
    });

    return {
      data: {
        uploadUrl: uploadData.signedUrl,
        publicUrl: publicUrlData.publicUrl,
        path: fileName,
        fileUploadId: fileUpload.id,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("이미지 업로드 URL 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

function validateUploadRequest(request: UploadImageRequest): string | null {
  const maxSize = 10 * 1024 * 1024;
  if (request.fileSize > maxSize) {
    return "파일 크기는 10MB를 초과할 수 없습니다.";
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(request.fileType)) {
    return "지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)";
  }

  if (!request.fileName || request.fileName.trim().length === 0) {
    return "파일명이 필요합니다.";
  }

  return null;
}

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
      console.error("❌ 이미지 삭제 실패:", deleteError);
      const error = new Error("이미지 삭제에 실패했습니다.");
      error.cause = 500;
      throw error;
    }

    await prisma.fileUpload.delete({
      where: { id: fileUpload.id },
    });

    console.log("✅ DB 레코드 삭제 완료:", fileUpload.id);

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
        relatedEntityType: request.relatedEntityType,
        relatedEntityId: request.relatedEntityId,
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

export async function cleanupOrphanFiles(): Promise<CleanupOrphanFilesResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24시간 전

    const orphanFiles = await prisma.fileUpload.findMany({
      where: {
        status: FileStatus.TEMPORARY,
        createdAt: {
          lte: cutoffTime,
        },
      },
    });

    if (orphanFiles.length === 0) {
      return {
        deletedCount: 0,
      };
    }

    const deletedFiles: string[] = [];
    const failedFiles: string[] = [];

    for (const file of orphanFiles) {
      try {
        const { error: deleteError } = await supabase.storage
          .from(file.bucket)
          .remove([file.filePath]);

        if (deleteError) {
          console.error(`❌ Storage 파일 삭제 실패: ${file.filePath}`, deleteError);
          failedFiles.push(file.filePath);
          continue;
        }

        await prisma.fileUpload.delete({
          where: { id: file.id },
        });

        deletedFiles.push(file.filePath);
        console.log(`🗑️ 고아 파일 삭제 완료: ${file.filePath}`);
      } catch (error) {
        console.error(`❌ 파일 처리 실패: ${file.filePath}`, error);
        failedFiles.push(file.filePath);
      }
    }

    console.log(
      `🧹 고아 파일 정리 완료: 성공 ${deletedFiles.length}개, 실패 ${failedFiles.length}개`,
    );

    return {
      deletedCount: deletedFiles.length,
      failedCount: failedFiles.length,
      deletedFiles: deletedFiles.slice(0, 10), // 최대 10개까지만 반환
      failedFiles: failedFiles.slice(0, 10),
    };
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("고아 파일 정리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

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
