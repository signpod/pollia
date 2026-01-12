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

export interface UseSingleImageOptions {
  bucket?: StorageBucket;
  initialUrl?: string | null;
  initialFileUploadId?: string | null;
  onUploadSuccess?: (data: UploadedImageData) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseSingleImageReturn {
  previewUrl: string | null;
  uploadedData: UploadedImageData | null;
  isUploading: boolean;
  upload: (file: File) => void;
  discard: () => void;
  markedInitialId: string | null;
  markInitialForDeletion: () => void;
  unmarkInitial: () => void;
  deleteMarkedInitial: () => void;
  reset: () => void;
}

export interface UseMultipleImagesOptions {
  bucket?: StorageBucket;
  initialImages?: Array<{
    id: string;
    url: string;
    fileUploadId?: string;
  }>;
  onUploadSuccess?: (id: string, data: UploadedImageData) => void;
  onUploadError?: (id: string, error: Error) => void;
}

export interface UseMultipleImagesReturn {
  getPreviewUrl: (id: string) => string | undefined;
  getUploadedData: (id: string) => UploadedImageData | undefined;
  isUploading: (id: string) => boolean;
  isAnyUploading: boolean;
  upload: (id: string, file: File) => void;
  discard: (id: string) => void;
  markedInitialIds: Set<string>;
  markInitialForDeletion: (id: string) => void;
  unmarkInitial: (id: string) => void;
  deleteAllMarkedInitials: () => void;
  reset: () => void;
}
