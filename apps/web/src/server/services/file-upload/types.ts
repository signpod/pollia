import type { StorageBucket } from "@/constants/buckets";
import type { ActionType } from "@prisma/client";

export interface CreateUploadUrlInput {
  fileName: string;
  fileSize: number;
  fileType: string;
  bucket?: StorageBucket;
  actionType: ActionType;
}

export interface UploadUrlResult {
  uploadUrl: string;
  publicUrl: string;
  path: string;
  fileUploadId: string;
}

export interface CleanupResult {
  deletedCount: number;
  failedCount: number;
  deletedFiles: string[];
  failedFiles: string[];
}
