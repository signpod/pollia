import { RelatedEntityType } from "@prisma/client";

export interface UploadImageRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  bucket?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

export interface UploadImageResponse {
  data: {
    uploadUrl: string;
    publicUrl: string;
    path: string;
    fileUploadId: string;
  };
}

export interface DeleteImageRequest {
  path: string;
  bucket?: string;
}

export type DeleteImageResponse = Record<string, never>;

export interface ConfirmFileRequest {
  fileUploadId: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

export type ConfirmFileResponse = Record<string, never>;

export interface CleanupOrphanFilesResponse {
  deletedCount: number;
  failedCount?: number;
  deletedFiles?: string[];
  failedFiles?: string[];
}
