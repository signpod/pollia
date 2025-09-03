"use client";

import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useEffect, useRef } from "react";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (prevUrlRef.current && prevUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = url;
    onChangeCoverImageUrl(url);
  };

  useEffect(() => {
    return () => {
      if (prevUrlRef.current && prevUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        투표 정보를 입력해 주세요
      </h1>

      <div style={{ display: "grid", gap: 12 }}>
        {/* <div>
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
            <img
              src={coverImageUrl}
              alt="cover"
              style={{ marginTop: 8, width: "100%", borderRadius: 12 }}
            />
          )}
        </div> */}

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


