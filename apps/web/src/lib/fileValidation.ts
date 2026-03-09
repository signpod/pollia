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

export function isWebpFile(fileName: string, fileType: string): boolean {
  const lowerFileName = fileName.toLowerCase();
  const lowerFileType = fileType.toLowerCase();

  return lowerFileType === "image/webp" || lowerFileName.endsWith(".webp");
}

export function shouldSkipCrop(file: File): boolean {
  if (isHeicFile(file.name, file.type)) return true;
  if (!file.type.startsWith("image/")) return true;
  return false;
}
