"use client";

import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { usePostImage } from "@/hooks/shared/useUploadImage";
import { CDN_BASE_URL } from "@/constants/config";

type Props = {
  coverImageUrl?: string;
  title: string;
  description: string;
  onChangeCoverImageUrl: (v?: string) => void;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
};

export default function InfoStep({
  coverImageUrl,
  title,
  description,
  onChangeCoverImageUrl,
  onChangeTitle,
  onChangeDescription,
}: Props) {
  const prevUrlRef = useRef<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const postImage = usePostImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onChangeCoverImageUrl(url);
    setUploadError(null);

    try {
      const uploadedUrl = await postImage.mutateAsync({ file, fileName: file.name, fileType: file.type });
      // 업로드 완료 시 최종 URL로 교체
      onChangeCoverImageUrl(`${CDN_BASE_URL}${uploadedUrl}`);
      // blob URL 정리
      if (prevUrlRef.current && prevUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = undefined;
      }
    } catch (err) {
      setUploadError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        투표 정보를 입력해 주세요
      </h1>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            대표 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="h-11 w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-input)" }}
          />
          {coverImageUrl && (
            <div style={{ position: "relative", marginTop: 8 }}>
              <img
                src={coverImageUrl}
                alt="cover"
                style={{ width: "100%", borderRadius: 12, display: "block" }}
              />
              {postImage.isPending && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  업로드 중...
                </div>
              )}
            </div>
          )}
          {uploadError && (
            <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 8 }}>{uploadError}</div>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            제목
          </label>
          <Input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="h-11"
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            설명
          </label>
          <Textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="설명을 입력하세요"
            rows={5}
            className="min-h-28"
          />
        </div>
      </div>
    </div>
  );
}


