import { generateBlurDataURL } from "@/lib/blurThumbnail";
import { isHeicFile } from "@/lib/fileValidation";
import { useCallback, useState } from "react";

export function useBlurThumbnail() {
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);

  const generateBlur = useCallback(async (file: File) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (isHeicFile(fileName, fileType) || !file.type.startsWith("image/")) {
      setBlurDataURL(null);
      return;
    }

    try {
      const blur = await generateBlurDataURL(file);
      setBlurDataURL(blur);
    } catch {
      setBlurDataURL(null);
    }
  }, []);

  const clearBlur = useCallback(() => {
    setBlurDataURL(null);
  }, []);

  return {
    blurDataURL,
    generateBlur,
    clearBlur,
  };
}
