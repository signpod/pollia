export interface CreateUploadUrlInput {
  fileName: string;
  fileSize: number;
  fileType: string;
  bucket?: string;
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
