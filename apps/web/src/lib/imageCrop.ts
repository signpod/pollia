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

    const sourceCanvas = document.createElement("canvas");
    const sourceCtx = sourceCanvas.getContext("2d");

    if (!sourceCtx) {
      throw new Error("Canvas context를 생성할 수 없습니다.");
    }

    sourceCanvas.width = cropSize.width;
    sourceCanvas.height = cropSize.height;

    sourceCtx.fillStyle = "#ffffff";
    sourceCtx.fillRect(0, 0, cropSize.width, cropSize.height);

    const centerX = cropSize.width / 2;
    const centerY = cropSize.height / 2;

    let baseDrawWidth: number;
    let baseDrawHeight: number;

    const isWider = image.width > image.height;
    if (isWider) {
      baseDrawWidth = cropSize.width;
      baseDrawHeight = image.height * (cropSize.width / image.width);
    } else {
      baseDrawHeight = cropSize.height;
      baseDrawWidth = image.width * (cropSize.height / image.height);
    }

    const scaledDrawWidth = baseDrawWidth * currentZoom;
    const scaledDrawHeight = baseDrawHeight * currentZoom;
    const scaledDrawX = centerX + currentCrop.x - scaledDrawWidth / 2;
    const scaledDrawY = centerY + currentCrop.y - scaledDrawHeight / 2;

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
      scaledDrawWidth,
      scaledDrawHeight,
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
        "image/jpeg",
        0.95,
      );
    });
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

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

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, bBoxWidth, bBoxHeight);

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
      "image/jpeg",
      0.95,
    );
  });
}
