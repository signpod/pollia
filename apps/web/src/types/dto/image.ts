import { RelatedEntityType } from "@prisma/client";

export interface UploadImageRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  bucket?: string;
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

export interface DeleteImageResponse {}

export interface ConfirmFileRequest {
  fileUploadId: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

export interface ConfirmFileResponse {}

export interface CleanupOrphanFilesResponse {
  deletedCount: number;
  failedCount?: number;
  deletedFiles?: string[];
  failedFiles?: string[];
}
