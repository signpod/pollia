"use client";

import { useCallback, useState } from "react";

interface UseCompletionImageDownloadOptions {
  completionImageUrl?: string | null;
  fallbackImageUrl?: string | null;
  missionTitle?: string | null;
  completionTitle?: string;
}

const CANVAS_WIDTH = 1080;
const PADDING = 48;
const IMAGE_SIZE = CANVAS_WIDTH - PADDING * 2;
const IMAGE_RADIUS = 48;
const LOGO_HEIGHT = 48;

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  radius: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max(size / img.width, size / img.height);
  const sw = size / scale;
  const sh = size / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, size, size);

  ctx.restore();
}

async function generateCompletionImage({
  imageUrl,
  missionTitle,
  completionTitle,
}: {
  imageUrl: string;
  missionTitle?: string | null;
  completionTitle?: string;
}): Promise<Blob> {
  const img = await loadImage(imageUrl);
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage("/images/pollia-logo.png");
  } catch {}

  const titleFontSize = 36;
  const subtitleFontSize = 28;
  const lineHeight = 1.4;

  let totalTextHeight = 0;
  if (missionTitle) totalTextHeight += subtitleFontSize * lineHeight;
  if (completionTitle) totalTextHeight += titleFontSize * lineHeight;
  if (missionTitle && completionTitle) totalTextHeight += 8;

  const dividerY = PADDING;
  const imageY = dividerY + 2 + PADDING;
  const textY = imageY + IMAGE_SIZE + PADDING;
  const logoY = textY + totalTextHeight + PADDING;
  const canvasHeight = logoY + (logoImg ? LOGO_HEIGHT + PADDING : PADDING);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(PADDING, dividerY, CANVAS_WIDTH - PADDING * 2, 2);

  ctx.shadowColor = "rgba(9, 9, 11, 0.16)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  drawRoundedImage(ctx, img, PADDING, imageY, IMAGE_SIZE, IMAGE_RADIUS);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.textAlign = "center";
  let currentY = textY;

  if (missionTitle) {
    ctx.font = `400 ${subtitleFontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#71717a";
    ctx.fillText(missionTitle, CANVAS_WIDTH / 2, currentY + subtitleFontSize);
    currentY += subtitleFontSize * lineHeight + 8;
  }

  if (completionTitle) {
    ctx.font = `700 ${titleFontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#18181b";
    ctx.fillText(completionTitle, CANVAS_WIDTH / 2, currentY + titleFontSize);
  }

  if (logoImg) {
    const logoScale = LOGO_HEIGHT / logoImg.height;
    const logoWidth = logoImg.width * logoScale;
    ctx.drawImage(logoImg, (CANVAS_WIDTH - logoWidth) / 2, logoY, logoWidth, LOGO_HEIGHT);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, "image/png");
  });
}

export function useCompletionImageDownload({
  completionImageUrl,
  fallbackImageUrl,
  missionTitle,
  completionTitle,
}: UseCompletionImageDownloadOptions) {
  const [isGenerating, setIsGenerating] = useState(false);

  const imageUrl = completionImageUrl || fallbackImageUrl;

  const handleSave = useCallback(async () => {
    if (!imageUrl || isGenerating) return;
    setIsGenerating(true);
    try {
      const blob = await generateCompletionImage({
        imageUrl,
        missionTitle,
        completionTitle,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${completionTitle ?? "pollia"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }, [imageUrl, missionTitle, completionTitle, isGenerating]);

  return { handleSave, isGenerating, canSave: !!imageUrl };
}
