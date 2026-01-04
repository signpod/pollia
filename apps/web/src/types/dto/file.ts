import type { StorageBucket } from "@/constants/buckets";
import type { ActionType } from "@prisma/client";

export interface UploadFileRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  bucket?: StorageBucket;
  actionType: ActionType;
}

export interface UploadFileResponse {
  data: {
    uploadUrl: string;
    publicUrl: string;
    path: string;
    fileUploadId: string;
  };
}

export interface DeleteFileRequest {
  path: string;
}

export type DeleteFileResponse = Record<string, never>;

export interface ConfirmFileRequest {
  fileUploadId: string;
}

export type ConfirmFileResponse = Record<string, never>;

export interface CleanupOrphanFilesResponse {
  deletedCount: number;
  failedCount?: number;
  deletedFiles?: string[];
  failedFiles?: string[];
}
