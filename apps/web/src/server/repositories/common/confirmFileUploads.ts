import { FileStatus, type Prisma, type PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * 임시(TEMPORARY) 상태의 파일 업로드를 확인(CONFIRMED) 상태로 변경합니다.
 *
 * @param tx - Prisma Transaction Client
 * @param userId - 사용자 ID (optional). 제공되면 해당 사용자의 파일만 확인하며,
 *                 생략 시 Service 계층에서 이미 권한 검증이 완료되었다고 가정
 * @param fileUploadIds - 확인할 파일 업로드 ID 또는 ID 배열
 *
 * @remarks
 * - Service 계층에서 인증/권한 검증이 완료된 후 호출되어야 합니다
 * - Transaction 내에서 실행되어 데이터 일관성을 보장합니다
 * - TEMPORARY 상태의 파일만 CONFIRMED로 변경됩니다
 */
export async function confirmFileUploads(
  tx: TransactionClient | Prisma.TransactionClient,
  userId?: string,
  fileUploadIds?: string | string[],
): Promise<void> {
  if (!fileUploadIds) return;

  const ids = Array.isArray(fileUploadIds) ? fileUploadIds : [fileUploadIds];
  const validIds = ids.filter(Boolean);

  if (validIds.length === 0) return;

  await tx.fileUpload.updateMany({
    where: {
      id: { in: validIds },
      ...(userId && { userId }),
      status: FileStatus.TEMPORARY,
    },
    data: {
      status: FileStatus.CONFIRMED,
      confirmedAt: new Date(),
    },
  });
}
