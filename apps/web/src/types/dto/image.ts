import { RelatedEntityType } from "@prisma/client";

export interface UploadImageRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  bucket?: string;
}

export interface UploadImageResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    publicUrl: string;
    path: string;
    fileUploadId: string;
  };
  error?: string;
}

export interface DeleteImageRequest {
  path: string;
  bucket?: string;
}

export interface DeleteImageResponse {
  success: boolean;
  error?: string;
}

export interface ConfirmFileRequest {
  fileUploadId: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

export interface ConfirmFileResponse {
  success: boolean;
  error?: string;
}

export interface CleanupOrphanFilesResponse {
  success: boolean;
  deletedCount?: number;
  failedCount?: number;
  deletedFiles?: string[];
  failedFiles?: string[];
  error?: string;
}
