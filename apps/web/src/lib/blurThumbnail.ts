const BLUR_THUMBNAIL_MAX_SIZE = 50;

export async function generateBlurDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const ratio = Math.min(
          BLUR_THUMBNAIL_MAX_SIZE / img.width,
          BLUR_THUMBNAIL_MAX_SIZE / img.height,
        );
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const blurDataURL = canvas.toDataURL("image/jpeg", 0.4);
        resolve(blurDataURL);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
