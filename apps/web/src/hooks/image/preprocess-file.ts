export async function preprocessFile(file: File): Promise<File> {
  const { preprocessGifForUpload } = await import("@/lib/gifCrop");
  return preprocessGifForUpload(file);
}
