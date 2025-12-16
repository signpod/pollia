const SKIP_CROP_FILE_EXTENSIONS = ["gif"] as const;

export function isHeicFile(fileName: string, fileType: string): boolean {
  const lowerFileName = fileName.toLowerCase();
  const lowerFileType = fileType.toLowerCase();

  return (
    lowerFileType === "image/heic" ||
    lowerFileType === "image/heif" ||
    lowerFileName.endsWith(".heic") ||
    lowerFileName.endsWith(".heif")
  );
}

export function isGifFile(fileName: string, fileType: string): boolean {
  const lowerFileName = fileName.toLowerCase();
  const lowerFileType = fileType.toLowerCase();

  return lowerFileType === "image/gif" || lowerFileName.endsWith(".gif");
}

export function shouldSkipCrop(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  if (isHeicFile(fileName, fileType) || isGifFile(fileName, fileType)) {
    return true;
  }

  if (!file.type.startsWith("image/")) {
    return true;
  }

  if (
    fileExtension &&
    SKIP_CROP_FILE_EXTENSIONS.includes(fileExtension as (typeof SKIP_CROP_FILE_EXTENSIONS)[number])
  ) {
    return true;
  }

  return false;
}
