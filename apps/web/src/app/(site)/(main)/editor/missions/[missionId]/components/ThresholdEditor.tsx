"use client";

import { LabelText, Typo } from "@repo/ui/components";
import { useRef, useState } from "react";

const SEGMENT_COLORS = [
  "bg-violet-200",
  "bg-blue-200",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-rose-200",
];

const HANDLE_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

interface ThresholdEditorProps {
  thresholds: number[];
  scoreRatios: Array<{ minScoreRatio: number; maxScoreRatio: number }>;
  onUpdateThreshold: (index: number, value: number) => void;
}

export function ThresholdEditor({
  thresholds,
  scoreRatios,
  onUpdateThreshold,
}: ThresholdEditorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  if (thresholds.length === 0) return null;

  const getValueFromPosition = (clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.round(Math.max(0, Math.min(100, ratio * 100)));
  };

  const clampThreshold = (index: number, value: number): number => {
    const min = index === 0 ? 1 : (thresholds[index - 1] ?? 0) + 1;
    const max = index === thresholds.length - 1 ? 99 : (thresholds[index + 1] ?? 100) - 1;
    return Math.max(min, Math.min(max, value));
  };

  const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIndex === null) return;
    const rawValue = getValueFromPosition(e.clientX);
    const clamped = clampThreshold(draggingIndex, rawValue);
    onUpdateThreshold(draggingIndex, clamped);
  };

  const handlePointerUp = () => {
    setDraggingIndex(null);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <LabelText required={false}>점수 범위 설정</LabelText>
      <Typo.Body size="medium" className="mb-4 mt-1 text-zinc-400">
        핸들을 드래그하여 각 결과 화면의 점수 범위를 조절합니다.
      </Typo.Body>

      <div className="mb-2 flex">
        {scoreRatios.map((ratio, idx) => {
          const width = ratio.maxScoreRatio - ratio.minScoreRatio + 1;
          return (
            <div
              key={idx}
              className="flex items-center justify-center overflow-hidden"
              style={{ width: `${width}%` }}
            >
              {width >= 15 ? (
                <Typo.Body size="small" className="truncate text-zinc-600">
                  결과 {idx + 1} ({ratio.minScoreRatio}~{ratio.maxScoreRatio}%)
                </Typo.Body>
              ) : width >= 8 ? (
                <Typo.Body size="small" className="truncate text-zinc-600">
                  결과 {idx + 1}
                </Typo.Body>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        ref={trackRef}
        className="relative flex h-10 w-full select-none overflow-hidden rounded-lg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {scoreRatios.map((ratio, idx) => {
          const width = ratio.maxScoreRatio - ratio.minScoreRatio + 1;
          const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          return (
            <div
              key={idx}
              className={`${colorClass} flex items-center justify-center`}
              style={{ width: `${width}%` }}
            />
          );
        })}

        {thresholds.map((threshold, idx) => {
          const isDragging = draggingIndex === idx;
          const handleColor = HANDLE_COLORS[idx % HANDLE_COLORS.length];
          return (
            <div
              key={idx}
              className="absolute top-0 z-10 flex h-full -translate-x-1/2 flex-col items-center justify-center"
              style={{ left: `${threshold}%` }}
              onPointerDown={handlePointerDown(idx)}
            >
              <div className="h-full w-0.5 bg-zinc-700/30" />
              <div
                className={`absolute left-1/2 -translate-x-1/2 flex size-7 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform ${
                  isDragging
                    ? `scale-110 cursor-grabbing ${handleColor}`
                    : `cursor-grab ${handleColor}`
                }`}
              >
                <span className="text-[10px] font-bold text-white">{threshold}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex justify-between">
        <Typo.Body size="small" className="text-zinc-400">
          0%
        </Typo.Body>
        <Typo.Body size="small" className="text-zinc-400">
          100%
        </Typo.Body>
      </div>
    </div>
  );
}
