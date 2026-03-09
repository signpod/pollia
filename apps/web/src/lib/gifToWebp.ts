import type { FFmpeg } from "@ffmpeg/ffmpeg";

import { isGifFile } from "@/lib/fileValidation";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

function buildWebpFile(data: Uint8Array | string, originalName: string): File {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return new File([bytes], `${nameWithoutExt}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

async function cleanup(ffmpeg: FFmpeg) {
  try {
    await ffmpeg.deleteFile("input.gif");
  } catch {}
  try {
    await ffmpeg.deleteFile("output.webp");
  } catch {}
}

export async function convertGifToWebp(file: File): Promise<File> {
  if (!isGifFile(file.name, file.type)) return file;

  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFFmpeg();

  try {
    await ffmpeg.writeFile("input.gif", await fetchFile(file));

    const exitCode = await ffmpeg.exec([
      "-i",
      "input.gif",
      "-c:v",
      "libwebp",
      "-loop",
      "0",
      "-quality",
      "75",
      "output.webp",
    ]);

    if (exitCode !== 0) {
      throw new Error("GIF 변환에 실패했습니다.");
    }

    const data = await ffmpeg.readFile("output.webp");
    return buildWebpFile(data, file.name);
  } finally {
    await cleanup(ffmpeg);
  }
}

export interface GifCropParams {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  rotation: number;
}

export function calculateGifCropParams(
  imageWidth: number,
  imageHeight: number,
  crop: { x: number; y: number },
  zoom: number,
  rotation: number,
  cropSize: number,
): GifCropParams {
  const imageAspect = imageWidth / imageHeight;
  const isWider = imageWidth > imageHeight;

  let baseDisplayWidth: number;
  let baseDisplayHeight: number;

  if (isWider) {
    baseDisplayWidth = cropSize;
    baseDisplayHeight = cropSize / imageAspect;
  } else {
    baseDisplayHeight = cropSize;
    baseDisplayWidth = cropSize * imageAspect;
  }

  const displayWidth = baseDisplayWidth * zoom;
  const displayHeight = baseDisplayHeight * zoom;

  const scaleFactor = Math.min(imageWidth / displayWidth, imageHeight / displayHeight);

  const outputSize = Math.round(cropSize * scaleFactor);

  const cropX = Math.round(imageWidth / 2 - outputSize / 2 - crop.x * scaleFactor);
  const cropY = Math.round(imageHeight / 2 - outputSize / 2 - crop.y * scaleFactor);

  return {
    cropX: Math.max(0, cropX),
    cropY: Math.max(0, cropY),
    cropWidth: Math.min(outputSize, imageWidth),
    cropHeight: Math.min(outputSize, imageHeight),
    rotation,
  };
}

export async function cropGifToWebp(file: File, params: GifCropParams): Promise<File> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFFmpeg();

  try {
    await ffmpeg.writeFile("input.gif", await fetchFile(file));

    const filters: string[] = [];

    if (params.rotation !== 0) {
      const radians = (params.rotation * Math.PI) / 180;
      filters.push(`rotate=${radians}:fillcolor=white`);
    }

    filters.push(`crop=${params.cropWidth}:${params.cropHeight}:${params.cropX}:${params.cropY}`);

    const exitCode = await ffmpeg.exec([
      "-i",
      "input.gif",
      "-vf",
      filters.join(","),
      "-c:v",
      "libwebp",
      "-loop",
      "0",
      "-quality",
      "75",
      "output.webp",
    ]);

    if (exitCode !== 0) {
      throw new Error("GIF 크롭에 실패했습니다.");
    }

    const data = await ffmpeg.readFile("output.webp");
    return buildWebpFile(data, file.name);
  } finally {
    await cleanup(ffmpeg);
  }
}
