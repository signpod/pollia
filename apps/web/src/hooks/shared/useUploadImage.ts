import { http } from "@/lib/http/default";
import { useMutation } from "@tanstack/react-query";
import imageCompression from 'browser-image-compression';

export interface UploadImageProps {
  file: File;
  fileName: string;
  fileType?: string;
}

interface PresignedRes {
  uploadUrl: string;
  imageUrl: string;
  id: string;
}

export function usePostImage() {
  return useMutation({
    mutationFn: async ({file, fileName, fileType = 'image/webp'}: UploadImageProps) => {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        useWebWorker: true,
        maxWidthOrHeight: 1920,
        fileType: fileType,
      });

      const meta = {
        originalFileName: fileName.split('.')[0],
        fileType: compressedFile.type,
        fileSize: compressedFile.size,
      };

      const presigned: PresignedRes = await http.post(`/files/images`, meta);

      const putRes = await fetch(presigned.uploadUrl, {method: 'PUT', body: compressedFile});

      if (!putRes.ok) throw new Error('S3 업로드 실패');

      return presigned.imageUrl;
    },
  });
}
