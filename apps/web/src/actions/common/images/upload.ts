"use server";

import { requireAuth } from "@/actions/common/auth";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import prisma from "@/database/utils/prisma/client";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { UploadImageRequest, UploadImageResponse } from "@/types/dto/image";
import { FileStatus } from "@prisma/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

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

    const bucket = request.bucket || STORAGE_BUCKETS.FALLBACK;
    const fileExtension = request.fileName.split(".").pop() || "";
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(fileName);

    if (uploadError) {
      console.error("Upload URL 생성 실패:", uploadError);
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
  if (request.fileSize > MAX_FILE_SIZE) {
    return "파일 크기는 10MB를 초과할 수 없습니다.";
  }

  const fileType = request.fileType?.toLowerCase() || "";
  const fileName = request.fileName?.toLowerCase() || "";

  const isImageByExtension =
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".webp") ||
    fileName.endsWith(".gif") ||
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif");

  if (!fileType && !isImageByExtension) {
    return "지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF, HEIC, HEIF만 가능)";
  }

  if (fileType && !ALLOWED_IMAGE_TYPES.includes(fileType) && !isImageByExtension) {
    return "지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF, HEIC, HEIF만 가능)";
  }

  if (!request.fileName || request.fileName.trim().length === 0) {
    return "파일명이 필요합니다.";
  }

  return null;
}
