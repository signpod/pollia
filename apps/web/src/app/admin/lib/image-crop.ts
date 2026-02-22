"use client";

export interface CropAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function createImageElement(imageSrc: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = imageSrc;
  });
}

export async function createCroppedImageFile(params: {
  imageSrc: string;
  croppedAreaPixels: CropAreaPixels;
  fileName: string;
  mimeType?: string;
  quality?: number;
}): Promise<File> {
  const { imageSrc, croppedAreaPixels, fileName, mimeType = "image/jpeg", quality = 0.92 } = params;

  const image = await createImageElement(imageSrc);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이미지 편집을 처리할 수 없습니다.");
  }

  canvas.width = Math.max(1, Math.floor(croppedAreaPixels.width));
  canvas.height = Math.max(1, Math.floor(croppedAreaPixels.height));

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("편집 결과를 생성하지 못했습니다."));
      },
      mimeType,
      quality,
    );
  });

  return new File([blob], fileName, { type: mimeType });
}
