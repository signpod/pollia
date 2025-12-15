import type { StorageBucket } from "@/constants/buckets";

export interface CreateUploadUrlInput {
  fileName: string;
  fileSize: number;
  fileType: string;
  bucket?: StorageBucket;
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
