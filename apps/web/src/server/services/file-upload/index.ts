import { STORAGE_BUCKETS } from "@/constants/buckets";
import {
  getAllowedExtensions,
  getAllowedMimeTypes,
  getFileSizeLabel,
  getMaxFileSize,
  isFileUploadActionType,
} from "@/constants/fileUpload";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { fileUploadRepository } from "@/server/repositories/file-upload/fileUploadRepository";
import { FileStatus, type FileUpload } from "@prisma/client";

import type { CleanupResult, CreateUploadUrlInput, UploadUrlResult } from "./types";

const TEMPORARY_FILE_RETENTION_HOURS = 24;

export type SupabaseClientFactory = typeof createServerSupabaseClient;
export type SupabaseClient = Awaited<ReturnType<SupabaseClientFactory>>;

export class FileUploadService {
  constructor(
    private repo = fileUploadRepository,
    private createSupabase: SupabaseClientFactory = createServerSupabaseClient,
  ) {}

  async createUploadUrl(input: CreateUploadUrlInput, userId: string): Promise<UploadUrlResult> {
    this.validateUploadInput(input);

    const supabase = await this.createSupabase();
    const bucket = input.bucket || STORAGE_BUCKETS.FALLBACK;
    const fileExtension = input.fileName.split(".").pop() || "";
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.error("Upload URL 생성 실패:", uploadError);
      const error = new Error("업로드 URL 생성에 실패했습니다.");
      error.cause = 500;
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    const fileUpload = await this.repo.create({
      userId,
      originalFileName: input.fileName,
      filePath,
      publicUrl: publicUrlData.publicUrl,
      fileSize: input.fileSize,
      mimeType: input.fileType,
      bucket,
      status: FileStatus.TEMPORARY,
    });

    return {
      uploadUrl: uploadData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      path: filePath,
      fileUploadId: fileUpload.id,
    };
  }

  async deleteFileByPath(filePath: string, userId: string): Promise<void> {
    const fileUpload = await this.repo.findByFilePathAndUserId(filePath, userId);

    if (!fileUpload) {
      const error = new Error("파일을 찾을 수 없거나 삭제 권한이 없습니다.");
      error.cause = 404;
      throw error;
    }

    const supabase = await this.createSupabase();
    const { error: deleteError } = await supabase.storage
      .from(fileUpload.bucket)
      .remove([filePath]);

    if (deleteError) {
      console.error("이미지 삭제 실패:", deleteError);
      const error = new Error("이미지 삭제에 실패했습니다.");
      error.cause = 500;
      throw error;
    }

    await this.repo.delete(fileUpload.id);
  }

  async deleteFileById(fileUploadId: string, userId: string): Promise<void> {
    const fileUpload = await this.repo.findByIdAndUserId(fileUploadId, userId);

    if (!fileUpload) {
      const error = new Error("파일을 찾을 수 없거나 삭제 권한이 없습니다.");
      error.cause = 404;
      throw error;
    }

    const supabase = await this.createSupabase();
    const { error: deleteError } = await supabase.storage
      .from(fileUpload.bucket)
      .remove([fileUpload.filePath]);

    if (deleteError) {
      console.error("파일 삭제 실패:", deleteError);
      const error = new Error("파일 삭제에 실패했습니다.");
      error.cause = 500;
      throw error;
    }

    await this.repo.delete(fileUpload.id);
  }

  async confirmFile(fileUploadId: string, userId: string): Promise<void> {
    const fileUpload = await this.repo.findTemporaryByIdAndUserId(fileUploadId, userId);

    if (!fileUpload) {
      const error = new Error("임시 파일을 찾을 수 없거나 이미 처리되었습니다.");
      error.cause = 404;
      throw error;
    }

    await this.repo.updateStatus(fileUploadId, FileStatus.CONFIRMED, new Date());
  }

  async getFileUpload(fileUploadId: string, userId: string): Promise<FileUpload> {
    const fileUpload = await this.repo.findByIdAndUserId(fileUploadId, userId);

    if (!fileUpload) {
      const error = new Error("파일을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return fileUpload;
  }

  async cleanupOrphanFiles(): Promise<CleanupResult> {
    const supabase = await this.createSupabase();
    const deletedFiles: string[] = [];
    const failedFiles: string[] = [];

    const temporaryCutoffTime = new Date(
      Date.now() - TEMPORARY_FILE_RETENTION_HOURS * 60 * 60 * 1000,
    );
    const temporaryOrphanFiles = await this.repo.findTemporaryOlderThan(temporaryCutoffTime);

    console.log(`TEMPORARY 고아 파일 ${temporaryOrphanFiles.length}개 발견`);

    for (const file of temporaryOrphanFiles) {
      const result = await this.deleteFileFromStorageAndDB(supabase, file);
      if (result.success) {
        deletedFiles.push(file.filePath);
      } else {
        failedFiles.push(file.filePath);
      }
    }

    const unreferencedFiles = await this.repo.findUnreferencedOlderThan(new Date());

    console.log(`참조 없는 고아 파일 ${unreferencedFiles.length}개 발견`);

    for (const file of unreferencedFiles) {
      const result = await this.deleteFileFromStorageAndDB(supabase, file);
      if (result.success) {
        deletedFiles.push(file.filePath);
      } else {
        failedFiles.push(file.filePath);
      }
    }

    console.log(`고아 파일 정리 완료: 성공 ${deletedFiles.length}개, 실패 ${failedFiles.length}개`);

    return {
      deletedCount: deletedFiles.length,
      failedCount: failedFiles.length,
      deletedFiles: deletedFiles.slice(0, 10),
      failedFiles: failedFiles.slice(0, 10),
    };
  }

  private validateUploadInput(input: CreateUploadUrlInput): void {
    const { actionType } = input;

    if (!isFileUploadActionType(actionType)) {
      const error = new Error("파일 업로드를 지원하지 않는 액션 타입입니다.");
      error.cause = 400;
      throw error;
    }

    const maxFileSize = getMaxFileSize(actionType);
    const allowedMimeTypes = getAllowedMimeTypes(actionType);
    const allowedExtensions = getAllowedExtensions(actionType);
    const fileSizeLabel = getFileSizeLabel(actionType);

    if (!maxFileSize || !allowedMimeTypes || !allowedExtensions) {
      const error = new Error("파일 업로드 설정을 찾을 수 없습니다.");
      error.cause = 500;
      throw error;
    }

    if (input.fileSize > maxFileSize) {
      const error = new Error(`파일 크기는 ${fileSizeLabel}를 초과할 수 없습니다.`);
      error.cause = 400;
      throw error;
    }

    const fileType = input.fileType?.toLowerCase() || "";
    const fileName = input.fileName?.toLowerCase() || "";

    const isValidByExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!fileType && !isValidByExtension) {
      const extensionList = allowedExtensions.join(", ");
      const error = new Error(`지원하지 않는 파일 형식입니다. (${extensionList}만 가능)`);
      error.cause = 400;
      throw error;
    }

    if (fileType && !allowedMimeTypes.includes(fileType) && !isValidByExtension) {
      const extensionList = allowedExtensions.join(", ");
      const error = new Error(`지원하지 않는 파일 형식입니다. (${extensionList}만 가능)`);
      error.cause = 400;
      throw error;
    }

    if (!input.fileName || input.fileName.trim().length === 0) {
      const error = new Error("파일명이 필요합니다.");
      error.cause = 400;
      throw error;
    }
  }

  private async deleteFileFromStorageAndDB(
    supabase: SupabaseClient,
    file: { id: string; bucket: string; filePath: string },
  ): Promise<{ success: boolean }> {
    try {
      const { error: deleteError } = await supabase.storage
        .from(file.bucket)
        .remove([file.filePath]);

      if (deleteError) {
        console.error(`Storage 파일 삭제 실패: ${file.filePath}`, deleteError);
        return { success: false };
      }

      await this.repo.delete(file.id);
      console.log(`고아 파일 삭제 완료: ${file.filePath}`);
      return { success: true };
    } catch (error) {
      console.error(`파일 처리 실패: ${file.filePath}`, error);
      return { success: false };
    }
  }
}

export const fileUploadService = new FileUploadService();
