"use server";

import prisma from "@/database/utils/prisma/client";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { CleanupOrphanFilesResponse } from "@/types/dto/image";
import { FileStatus } from "@prisma/client";

const TEMPORARY_FILE_RETENTION_HOURS = 24;
const UNREFERENCED_FILE_RETENTION_HOURS = 72;

export async function cleanupOrphanFiles(): Promise<CleanupOrphanFilesResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    const deletedFiles: string[] = [];
    const failedFiles: string[] = [];

    // 1. TEMPORARY 상태이고 24시간 지난 파일 삭제
    const temporaryCutoffTime = new Date(
      Date.now() - TEMPORARY_FILE_RETENTION_HOURS * 60 * 60 * 1000,
    );

    const temporaryOrphanFiles = await prisma.fileUpload.findMany({
      where: {
        status: FileStatus.TEMPORARY,
        createdAt: {
          lte: temporaryCutoffTime,
        },
      },
    });

    console.log(`TEMPORARY 고아 파일 ${temporaryOrphanFiles.length}개 발견`);

    for (const file of temporaryOrphanFiles) {
      const result = await deleteFileFromStorageAndDB(supabase, file);
      if (result.success) {
        deletedFiles.push(file.filePath);
      } else {
        failedFiles.push(file.filePath);
      }
    }

    // 2. 참조가 없고 72시간 지난 파일 삭제
    const unreferencedCutoffTime = new Date(
      Date.now() - UNREFERENCED_FILE_RETENTION_HOURS * 60 * 60 * 1000,
    );

    const unreferencedFiles = await prisma.fileUpload.findMany({
      where: {
        createdAt: {
          lte: unreferencedCutoffTime,
        },
        actionOptions: { none: {} },
        missionImages: { none: {} },
        missionBrandLogos: { none: {} },
        actionImages: { none: {} },
        actionAnswerImages: { none: {} },
      },
    });

    console.log(`참조 없는 고아 파일 ${unreferencedFiles.length}개 발견`);

    for (const file of unreferencedFiles) {
      const result = await deleteFileFromStorageAndDB(supabase, file);
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
  } catch (error) {
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("고아 파일 정리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

async function deleteFileFromStorageAndDB(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  file: { id: string; bucket: string; filePath: string },
): Promise<{ success: boolean }> {
  try {
    const { error: deleteError } = await supabase.storage.from(file.bucket).remove([file.filePath]);

    if (deleteError) {
      console.error(`Storage 파일 삭제 실패: ${file.filePath}`, deleteError);
      return { success: false };
    }

    await prisma.fileUpload.delete({
      where: { id: file.id },
    });

    console.log(`고아 파일 삭제 완료: ${file.filePath}`);
    return { success: true };
  } catch (error) {
    console.error(`파일 처리 실패: ${file.filePath}`, error);
    return { success: false };
  }
}
