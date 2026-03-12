import type { Prisma, PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface FileUploadFieldMapping {
  idField: string;
  urlField?: string;
}

/**
 * FK 제약 조건 위반을 방지하기 위해 존재하지 않는 FileUpload 참조를 null로 대체합니다.
 *
 * 드래프트 복원 등으로 인해 이미 삭제된 TEMPORARY FileUpload ID가
 * data에 포함될 수 있으며, 이 경우 prisma create/update 시 FK 위반이 발생합니다.
 *
 * @param tx - Prisma Transaction Client
 * @param data - create/update에 전달할 데이터 객체
 * @param fields - 검증할 FileUpload ID 필드와 연관 URL 필드 매핑
 * @returns 존재하지 않는 FileUpload 참조가 null로 대체된 데이터
 */
export async function sanitizeFileUploadRefs<T extends Record<string, unknown>>(
  tx: TransactionClient | Prisma.TransactionClient,
  data: T,
  fields: FileUploadFieldMapping[],
): Promise<T> {
  const idsToCheck: string[] = [];
  const fieldsByIds = new Map<string, FileUploadFieldMapping[]>();

  for (const field of fields) {
    const value = data[field.idField];
    if (typeof value === "string") {
      idsToCheck.push(value);
      const existing = fieldsByIds.get(value) ?? [];
      existing.push(field);
      fieldsByIds.set(value, existing);
    }
  }

  if (idsToCheck.length === 0) return data;

  const existingUploads = await tx.fileUpload.findMany({
    where: { id: { in: idsToCheck } },
    select: { id: true },
  });
  const existingIds = new Set(existingUploads.map(u => u.id));

  let hasStaleRef = false;
  for (const id of idsToCheck) {
    if (!existingIds.has(id)) {
      hasStaleRef = true;
      break;
    }
  }

  if (!hasStaleRef) return data;

  const sanitized = { ...data };
  for (const [id, mappings] of fieldsByIds) {
    if (!existingIds.has(id)) {
      for (const mapping of mappings) {
        (sanitized as Record<string, unknown>)[mapping.idField] = null;
        if (mapping.urlField) {
          (sanitized as Record<string, unknown>)[mapping.urlField] = null;
        }
      }
    }
  }

  return sanitized;
}

/**
 * 주어진 FileUpload ID 목록 중 실제로 존재하는 ID만 반환합니다.
 * options 배열 등 복잡한 구조에서 fileUploadId를 검증할 때 사용합니다.
 */
export async function getValidFileUploadIds(
  tx: TransactionClient | Prisma.TransactionClient,
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  const existing = await tx.fileUpload.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  return new Set(existing.map(u => u.id));
}
