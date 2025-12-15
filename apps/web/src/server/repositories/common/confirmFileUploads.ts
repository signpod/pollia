import { FileStatus, type Prisma, type PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function confirmFileUploads(
  tx: TransactionClient | Prisma.TransactionClient,
  userId: string,
  fileUploadIds?: string | string[],
): Promise<void> {
  if (!fileUploadIds) return;

  const ids = Array.isArray(fileUploadIds) ? fileUploadIds : [fileUploadIds];
  const validIds = ids.filter(Boolean);

  if (validIds.length === 0) return;

  await tx.fileUpload.updateMany({
    where: {
      id: { in: validIds },
      userId,
      status: FileStatus.TEMPORARY,
    },
    data: {
      status: FileStatus.CONFIRMED,
      confirmedAt: new Date(),
    },
  });
}
