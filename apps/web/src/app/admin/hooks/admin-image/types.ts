import type { StorageBucket } from "@/constants/buckets";

export interface UploadedImageData {
  publicUrl: string;
  fileUploadId: string;
  path: string;
}

export interface UseUploadImageOptions {
  bucket?: StorageBucket;
  onUploadSuccess?: (data: UploadedImageData) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseUploadImageReturn {
  previewUrl: string | null;
  uploadedData: UploadedImageData | null;
  isUploading: boolean;
  upload: (file: File) => void;
  discard: () => void;
}

export interface UseDeleteImageReturn {
  markedId: string | null;
  isDeleting: boolean;
  mark: (fileUploadId: string) => void;
  unmark: () => void;
  deleteById: (fileUploadId: string) => void;
  deleteMarked: () => void;
}
