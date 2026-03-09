import { isGifFile } from "@/lib/fileValidation";
import { ActionType } from "@prisma/client";

const MB = 1024 * 1024;

export type FileUploadActionType =
  | typeof ActionType.IMAGE
  | typeof ActionType.PDF
  | typeof ActionType.VIDEO;

export const ALLOWED_MIME_TYPES: Record<FileUploadActionType, readonly string[]> = {
  [ActionType.IMAGE]: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],
  [ActionType.PDF]: ["application/pdf"],
  [ActionType.VIDEO]: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
} as const;

export const ALLOWED_FILE_EXTENSIONS: Record<FileUploadActionType, readonly string[]> = {
  [ActionType.IMAGE]: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
  [ActionType.PDF]: [".pdf"],
  [ActionType.VIDEO]: [".mp4", ".webm", ".mov", ".avi"],
} as const;

export const MAX_FILE_SIZE: Record<FileUploadActionType, number> = {
  [ActionType.IMAGE]: 5 * MB,
  [ActionType.PDF]: 50 * MB,
  [ActionType.VIDEO]: 50 * MB,
} as const;

export const FILE_SIZE_LABELS: Record<FileUploadActionType, string> = {
  [ActionType.IMAGE]: "5MB",
  [ActionType.PDF]: "50MB",
  [ActionType.VIDEO]: "50MB",
} as const;

export function getAllowedMimeTypes(actionType: ActionType): readonly string[] | undefined {
  return ALLOWED_MIME_TYPES[actionType as FileUploadActionType];
}

export function getAllowedExtensions(actionType: ActionType): readonly string[] | undefined {
  return ALLOWED_FILE_EXTENSIONS[actionType as FileUploadActionType];
}

export function getMaxFileSize(actionType: ActionType): number | undefined {
  return MAX_FILE_SIZE[actionType as FileUploadActionType];
}

export function getFileSizeLabel(actionType: ActionType): string | undefined {
  return FILE_SIZE_LABELS[actionType as FileUploadActionType];
}

export const MAX_GIF_FILE_SIZE = 50 * MB;
export const GIF_FILE_SIZE_LABEL = "50MB";

export function getImageMaxFileSize(fileName: string, fileType: string): number {
  if (isGifFile(fileName, fileType)) return MAX_GIF_FILE_SIZE;
  return MAX_FILE_SIZE[ActionType.IMAGE];
}

export function getImageFileSizeLabel(fileName: string, fileType: string): string {
  if (isGifFile(fileName, fileType)) return GIF_FILE_SIZE_LABEL;
  return FILE_SIZE_LABELS[ActionType.IMAGE];
}

export function isFileUploadActionType(actionType: ActionType): actionType is FileUploadActionType {
  return (
    actionType === ActionType.IMAGE ||
    actionType === ActionType.PDF ||
    actionType === ActionType.VIDEO
  );
}
