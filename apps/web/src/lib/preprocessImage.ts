export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "jpeg" | "webp" | "png";
}

const DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: "webp",
};

/**
 * 이미지 파일을 전처리합니다 (리사이징, 압축, 포맷 변환)
 * @param file 원본 이미지 파일
 * @param options 전처리 옵션
 * @returns 전처리된 이미지 파일
 */
export async function preprocessImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<File> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context를 생성할 수 없습니다."));
      return;
    }

    img.onload = () => {
      try {
        let { width, height } = img;

        if (width > config.maxWidth || height > config.maxHeight) {
          const ratio = Math.min(
            config.maxWidth / width,
            config.maxHeight / height
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalName = file.name;
              const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
              const newFileName = `${nameWithoutExt}.${config.format}`;

              const processedFile = new File([blob], newFileName, {
                type: `image/${config.format}`,
                lastModified: Date.now(),
              });

              URL.revokeObjectURL(img.src);
              resolve(processedFile);
            } else {
              reject(new Error("이미지를 Blob으로 변환하는데 실패했습니다."));
            }
          },
          `image/${config.format}`,
          config.quality
        );
      } catch (error) {
        reject(
          error instanceof Error ? error : new Error("이미지 처리 중 오류 발생")
        );
      }
    };

    img.onerror = () => {
      reject(new Error("이미지를 로드하는데 실패했습니다."));
    };

    img.src = URL.createObjectURL(file);
  });
}
