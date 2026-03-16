import { getCroppedImg } from "@/lib/imageCrop";
import { useCallback, useState } from "react";

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3;
const ZOOM_DEFAULT = 1;
const ROTATION_MIN = 0;
const ROTATION_MAX = 360;
const ROTATION_DEFAULT = 0;
const CROP_DEFAULT = { x: 0, y: 0 };
const CROP_SIZE = 360;

export const CROP_CONSTANTS = {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_DEFAULT,
  ROTATION_MIN,
  ROTATION_MAX,
  ROTATION_DEFAULT,
  CROP_DEFAULT,
  CROP_SIZE,
} as const;

export function useImageCrop() {
  const [crop, setCrop] = useState(CROP_DEFAULT);
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [rotation, setRotation] = useState(ROTATION_DEFAULT);

  const resetCropState = useCallback(() => {
    setCrop(CROP_DEFAULT);
    setZoom(ZOOM_DEFAULT);
    setRotation(ROTATION_DEFAULT);
  }, []);

  const cropImage = useCallback(
    async (imageSrc: string, originalFile: File): Promise<File> => {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        { width: CROP_SIZE, height: CROP_SIZE, x: 0, y: 0 },
        rotation,
        true,
        crop,
        zoom,
      );

      const webpName = originalFile.name.replace(/\.[^/.]+$/, ".webp");
      return new File([croppedBlob], webpName, {
        type: "image/webp",
        lastModified: Date.now(),
      });
    },
    [crop, zoom, rotation],
  );

  return {
    crop,
    zoom,
    rotation,
    setCrop,
    setZoom,
    setRotation,
    resetCropState,
    cropImage,
  };
}
