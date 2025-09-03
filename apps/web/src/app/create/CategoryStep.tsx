"use client";

import { memo, useMemo } from "react";
import type { Category as LocalCategory } from "./page";
import { useCategories } from "@/hooks/categories/useCategories";

type Props = {
  selected: LocalCategory | null;
  onSelect: (c: LocalCategory) => void;
};

function CategoryStepImpl({ selected, onSelect }: Props) {
  const { data, isLoading } = useCategories();

  const categories = useMemo(() => {
    const fetched = (data ?? []) as string[];
    return fetched.length > 0 ? fetched : [];
  }, [data]);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        카테고리를 선택해 주세요
      </h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-[--color-muted] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          {categories.map((c) => {
            const isSel = selected === (c as unknown as LocalCategory);
            return (
              <button
                key={c}
                onClick={() => onSelect(c as unknown as LocalCategory)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: `2px solid ${isSel ? "#111" : "#e5e7eb"}`,
                  background: isSel ? "#f3f4f6" : "white",
                  textAlign: "center",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(CategoryStepImpl);


