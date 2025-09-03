"use client";

import { Category } from "@/types/poll";
import type { PollOption } from "./page";

type Props = {
  category: Category | null;
  title: string;
  description?: string;
  options: PollOption[];
};

export default function CompleteStep({ category, title, description, options }: Props) {
  const share = async () => {
    const text = `투표 참여하기: ${title}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("링크를 클립보드에 복사했어요");
    }
  };

  const go = () => {
    alert("투표 상세로 이동 로직을 연결하세요");
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>생성이 완료되었어요</h1>
      <div style={{ color: "#6b7280", marginBottom: 16 }}>
        카테고리: {category?.name || category?.id || "-"}
      </div>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
          display: "grid",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 700 }}>{title}</div>
        {description && <div style={{ color: "#6b7280" }}>{description}</div>}
        <div style={{ color: "#9ca3af", fontSize: 12 }}>선택지 {options.length}개</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={share}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          공유하기
        </button>
        <button
          onClick={go}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
          }}
        >
          바로가기
        </button>
      </div>
    </div>
  );
}


