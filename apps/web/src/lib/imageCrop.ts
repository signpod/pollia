interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", error => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  includeFullImage = false,
  crop?: { x: number; y: number },
  zoom?: number,
): Promise<Blob> {
  const image = await createImage(imageSrc);

  if (includeFullImage) {
    const cropSize = {
      width: pixelCrop.width,
      height: pixelCrop.height,
    };

    const currentZoom = zoom ?? 1;
    const currentCrop = crop ?? { x: 0, y: 0 };

    const imageAspect = image.width / image.height;
    const isWider = image.width > image.height;

    let baseDisplayWidth: number;
    let baseDisplayHeight: number;

    if (isWider) {
      baseDisplayWidth = cropSize.width;
      baseDisplayHeight = cropSize.width / imageAspect;
    } else {
      baseDisplayHeight = cropSize.height;
      baseDisplayWidth = cropSize.height * imageAspect;
    }

    const displayWidth = baseDisplayWidth * currentZoom;
    const displayHeight = baseDisplayHeight * currentZoom;

    const scaleFactorX = image.width / displayWidth;
    const scaleFactorY = image.height / displayHeight;
    const maxScaleFactor = Math.min(image.width / cropSize.width, image.height / cropSize.height);
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY, maxScaleFactor);

    const outputWidth = Math.round(cropSize.width * scaleFactor);
    const outputHeight = Math.round(cropSize.height * scaleFactor);

    const sourceCanvas = document.createElement("canvas");
    const sourceCtx = sourceCanvas.getContext("2d", {
      willReadFrequently: false,
    });

    if (!sourceCtx) {
      throw new Error("Canvas context를 생성할 수 없습니다.");
    }

    sourceCanvas.width = outputWidth;
    sourceCanvas.height = outputHeight;

    sourceCtx.imageSmoothingEnabled = true;
    sourceCtx.imageSmoothingQuality = "high";

    const centerX = outputWidth / 2;
    const centerY = outputHeight / 2;

    const scaledDisplayWidth = displayWidth * scaleFactor;
    const scaledDisplayHeight = displayHeight * scaleFactor;

    const scaledDrawX = centerX + currentCrop.x * scaleFactor - scaledDisplayWidth / 2;
    const scaledDrawY = centerY + currentCrop.y * scaleFactor - scaledDisplayHeight / 2;

    const rotRad = getRadianAngle(rotation);
    sourceCtx.save();
    sourceCtx.translate(centerX, centerY);
    sourceCtx.rotate(rotRad);
    sourceCtx.translate(-centerX, -centerY);

    sourceCtx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      scaledDrawX,
      scaledDrawY,
      scaledDisplayWidth,
      scaledDisplayHeight,
    );

    sourceCtx.restore();

    return new Promise((resolve, reject) => {
      sourceCanvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("이미지를 Blob으로 변환하는데 실패했습니다."));
          }
        },
        "image/webp",
        0.9,
      );
    });
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: false,
  });

  if (!ctx) {
    throw new Error("Canvas context를 생성할 수 없습니다.");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    pixelCrop.width,
    pixelCrop.height,
    rotation,
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-pixelCrop.width / 2, -pixelCrop.height / 2);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("이미지를 Blob으로 변환하는데 실패했습니다."));
        }
      },
      "image/webp",
      0.9,
    );
  });
}
