"use client";

import { useCallback, useState } from "react";

interface UseCompletionImageDownloadOptions {
  completionImageUrl?: string | null;
  fallbackImageUrl?: string | null;
  missionTitle?: string | null;
  completionTitle?: string;
}

const FIGMA_WIDTH = 390;
const CANVAS_WIDTH = 1080;
const SCALE = CANVAS_WIDTH / FIGMA_WIDTH;
const PADDING = Math.round(20 * SCALE);
const IMAGE_SIZE = CANVAS_WIDTH - PADDING * 2;
const IMAGE_RADIUS = Math.round(16 * SCALE);
const LOGO_HEIGHT = Math.round(18 * SCALE);
const IMAGE_TEXT_GAP = Math.round(40 * SCALE);
const SUBTITLE_TITLE_GAP = Math.round(4 * SCALE);
const DIVIDER_PADDING = Math.round(16 * SCALE);

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

  const subtitleFontSize = Math.round(16 * SCALE);
  const titleFontSize = Math.round(24 * SCALE);
  const lineHeight = 1.5;

  const maxTextWidth = CANVAS_WIDTH - PADDING * 2;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d")!;

  function wrapText(text: string, fontSize: number, fontWeight: number): string[] {
    tempCtx.font = `${fontWeight} ${fontSize}px "SUIT Variable", -apple-system, "Helvetica Neue", sans-serif`;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (tempCtx.measureText(testLine).width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  const subtitleLines = missionTitle ? wrapText(missionTitle, subtitleFontSize, 700) : [];
  const titleLines = completionTitle ? wrapText(completionTitle, titleFontSize, 700) : [];

  let totalTextHeight = 0;
  if (missionTitle) totalTextHeight += subtitleLines.length * subtitleFontSize * lineHeight;
  if (completionTitle) totalTextHeight += titleLines.length * titleFontSize * lineHeight;
  if (missionTitle && completionTitle) totalTextHeight += SUBTITLE_TITLE_GAP;

  const imageY = PADDING;
  const textY = imageY + IMAGE_SIZE + IMAGE_TEXT_GAP;
  const dividerY = textY + totalTextHeight + DIVIDER_PADDING;
  const logoY = dividerY + 2 + DIVIDER_PADDING;
  const canvasHeight = logoY + (logoImg ? LOGO_HEIGHT + PADDING : PADDING);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

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
    ctx.font = `700 ${subtitleFontSize}px "SUIT Variable", -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#71717a";
    for (const line of subtitleLines) {
      ctx.fillText(line, CANVAS_WIDTH / 2, currentY + subtitleFontSize);
      currentY += subtitleFontSize * lineHeight;
    }
    currentY += SUBTITLE_TITLE_GAP;
  }

  if (completionTitle) {
    ctx.font = `700 ${titleFontSize}px "SUIT Variable", -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#18181b";
    for (const line of titleLines) {
      ctx.fillText(line, CANVAS_WIDTH / 2, currentY + titleFontSize);
      currentY += titleFontSize * lineHeight;
    }
  }

  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(0, dividerY, CANVAS_WIDTH, 2);

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
