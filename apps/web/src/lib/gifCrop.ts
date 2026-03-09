import { MAX_FILE_SIZE } from "@/constants/fileUpload";
import { isGifFile } from "@/lib/fileValidation";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { ActionType } from "@prisma/client";

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

function buildFile(data: Uint8Array | string, originalName: string, format: "webp" | "gif"): File {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  const mimeType = format === "webp" ? "image/webp" : "image/gif";
  return new File([bytes], `${nameWithoutExt}.${format}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

async function cleanup(ffmpeg: FFmpeg, files: string[]) {
  for (const f of files) {
    try {
      await ffmpeg.deleteFile(f);
    } catch {}
  }
}

export function prefetchFFmpeg(): void {
  getFFmpeg().catch(() => {});
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

export async function cropGif(file: File, params: GifCropParams): Promise<File> {
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

    const filterChain = filters.join(",");
    const gifFilter = `${filterChain},split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a`;

    const exitCode = await ffmpeg.exec([
      "-i",
      "input.gif",
      "-filter_complex",
      gifFilter,
      "-loop",
      "0",
      "output.gif",
    ]);

    if (exitCode !== 0) {
      throw new Error("GIF 크롭에 실패했습니다.");
    }

    const data = await ffmpeg.readFile("output.gif");
    return buildFile(data, file.name, "gif");
  } finally {
    await cleanup(ffmpeg, ["input.gif", "output.gif"]);
  }
}

const IMAGE_MAX_SIZE = MAX_FILE_SIZE[ActionType.IMAGE];

async function convertGifToWebp(file: File): Promise<File | null> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFFmpeg();

  try {
    await ffmpeg.writeFile("input.gif", await fetchFile(file));

    const exitCode = await ffmpeg.exec([
      "-i",
      "input.gif",
      "-c:v",
      "libwebp_anim",
      "-loop",
      "0",
      "output.webp",
    ]);

    if (exitCode !== 0) return null;

    const data = await ffmpeg.readFile("output.webp");
    return buildFile(data, file.name, "webp");
  } catch {
    return null;
  } finally {
    await cleanup(ffmpeg, ["input.gif", "output.webp"]);
  }
}

export async function preprocessGifForUpload(file: File): Promise<File> {
  if (!isGifFile(file.name, file.type)) return file;

  const webp = await convertGifToWebp(file);
  if (webp && webp.size <= IMAGE_MAX_SIZE) return webp;

  return file;
}
