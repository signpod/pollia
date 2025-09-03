"use client";

import { Category } from "@/types/poll";
import type { PollOption } from "./page";
import { useRouter } from "next/navigation";

type Props = {
  pollId?: string | null;
  category: Category | null;
  title: string;
  description?: string;
  options: PollOption[];
};

export default function CompleteStep({ pollId, category, title, description, options }: Props) {
  const router = useRouter();
  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const targetUrl = pollId ? `${origin}/poll/${pollId}` : origin;
    const text = `투표 참여하기: ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: targetUrl });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${targetUrl}`);
      alert("주소가 복사되었습니다.");
    }
  };

  const go = () => {
    if (pollId) {
      router.replace(`/poll/${pollId}`);
    } else {
      alert("생성된 투표 ID가 없습니다.");
    }
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


