"use client";

import { memo } from "react";
import type { Category } from "./page";

const categories: Category[] = [
  "패션",
  "음식",
  "영화",
  "음악",
  "게임",
  "여행",
  "스포츠",
  "도서",
  "IT",
  "기타",
];

type Props = {
  selected: Category | null;
  onSelect: (c: Category) => void;
};

function CategoryStepImpl({ selected, onSelect }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        카테고리를 선택해 주세요
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {categories.map((c) => {
          const isSelected = selected === c;
          return (
            <button
              key={c}
              onClick={() => onSelect(c)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: `2px solid ${isSelected ? "#111" : "#e5e7eb"}`,
                background: isSelected ? "#f3f4f6" : "white",
                textAlign: "center",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CategoryStepImpl);


