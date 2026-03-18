"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { LabelText, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";
import { AlertCircle, Plus } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { completionScrollTargetItemKeyAtom } from "../atoms/editorCompletionAtoms";
import type { CompletionFormHandle } from "./CompletionForm";
import { CompletionItem } from "./CompletionItem";
import type { CompletionSettingsCardProps } from "./completionSettingsCard.types";
import { formatScoreRange } from "./completionSettingsCard.utils";
import type { SectionSaveHandle } from "./editor-save.types";
import { useCompletionSettingsCard } from "./useCompletionSettingsCard";

export type { CompletionSectionDraftSnapshot } from "./completionSettingsCard.types";

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

function ThresholdEditor({
  thresholds,
  scoreRatios,
  onUpdateThreshold,
}: {
  thresholds: number[];
  scoreRatios: Array<{ minScoreRatio: number; maxScoreRatio: number }>;
  onUpdateThreshold: (index: number, value: number) => void;
}) {
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

function CompletionSettingsCardComponent(
  props: CompletionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const { viewState, listState, quizState, formRefs, handlers, saveHandle } =
    useCompletionSettingsCard(props);

  useImperativeHandle(ref, () => saveHandle, [saveHandle]);

  const { isSaving, isLoading, hasValidationIssues, validationIssueCount } = viewState;

  const { completionItems, openItemKey, existingFormVersionById, draftHydrationVersion } =
    listState;

  const {
    handleAddDraft,
    handleRemoveDraft,
    handleRemoveExisting,
    handleToggleItem,
    handleItemDirtyChange,
    handleItemValidationChange,
    handleItemRawSnapshotChange,
    setCompletionDraftTitle,
    registerCompletionDraftForm,
  } = handlers;

  const handleFormRef = useCallback(
    (itemKey: string, instance: CompletionFormHandle | null) => {
      formRefs.current[itemKey] = instance;
    },
    [formRefs],
  );

  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevHighlightRef = useRef<HTMLDivElement | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollTargetKey, setScrollTargetKey] = useAtom(completionScrollTargetItemKeyAtom);

  const openItemKeyRef = useRef(openItemKey);
  openItemKeyRef.current = openItemKey;
  const handleToggleItemRef = useRef(handleToggleItem);
  handleToggleItemRef.current = handleToggleItem;

  useEffect(() => {
    if (!scrollTargetKey) {
      return;
    }

    setScrollTargetKey(null);

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }

    if (prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove("action-item-highlight");
      prevHighlightRef.current = null;
    }

    if (openItemKeyRef.current !== scrollTargetKey) {
      handleToggleItemRef.current(scrollTargetKey);
    }

    const targetEl = listContainerRef.current?.querySelector<HTMLDivElement>(
      `[data-editor-item-key="${CSS.escape(scrollTargetKey)}"]`,
    );
    if (!targetEl) {
      return;
    }

    prevHighlightRef.current = targetEl;
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    targetEl.classList.add("action-item-highlight");
    highlightTimerRef.current = setTimeout(() => {
      targetEl.classList.remove("action-item-highlight");
      if (prevHighlightRef.current === targetEl) {
        prevHighlightRef.current = null;
      }
      highlightTimerRef.current = null;
    }, 1500);
  }, [scrollTargetKey, setScrollTargetKey]);

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>결과 화면 수정</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              {UBIQUITOUS_CONSTANTS.MISSION} 완료 후 노출될 결과 화면을 추가하고 수정합니다.
            </Typo.Body>
          </div>
          {hasValidationIssues ? (
            <div
              className="flex shrink-0 items-center gap-1 text-red-500"
              title="입력 확인 필요"
              aria-label="입력 확인 필요"
            >
              <AlertCircle className="size-4" />
              <Typo.Body size="small" className="font-semibold text-red-500">
                {validationIssueCount}
              </Typo.Body>
            </div>
          ) : null}
        </div>
      </div>

      <div ref={listContainerRef} className="flex flex-col gap-4 px-5 py-5">
        {quizState.isQuizMode && completionItems.length >= 2 && (
          <ThresholdEditor
            thresholds={quizState.thresholds}
            scoreRatios={quizState.scoreRatios}
            onUpdateThreshold={quizState.updateThreshold}
          />
        )}

        {isLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.Body size="medium" className="text-zinc-500">
              로딩 중...
            </Typo.Body>
          </div>
        ) : completionItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.SubTitle>아직 결과 화면이 없습니다</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-2 text-zinc-500">
              결과 화면 추가 버튼으로 첫 결과 화면을 생성해주세요.
            </Typo.Body>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {completionItems.map((item, index) => {
              const formKey =
                item.kind === "existing"
                  ? `${item.key}:${existingFormVersionById[item.completion.id] ?? 0}:${draftHydrationVersion}`
                  : `${item.key}:${draftHydrationVersion}`;

              const scoreRange =
                quizState.isQuizMode && quizState.scoreRatios[index]
                  ? formatScoreRange(
                      quizState.scoreRatios[index].minScoreRatio,
                      quizState.scoreRatios[index].maxScoreRatio,
                    )
                  : undefined;

              return (
                <CompletionItem
                  key={item.key}
                  item={item}
                  itemKey={item.key}
                  index={index}
                  isOpen={openItemKey === item.key}
                  isSaving={isSaving}
                  missionId={props.missionId}
                  formKey={formKey}
                  scoreRangeLabel={scoreRange}
                  onFormRef={handleFormRef}
                  onRegisterDraftForm={registerCompletionDraftForm}
                  onToggle={handleToggleItem}
                  onRemoveDraft={handleRemoveDraft}
                  onRemoveExisting={handleRemoveExisting}
                  onDirtyChange={handleItemDirtyChange}
                  onValidationStateChange={handleItemValidationChange}
                  onRawSnapshotChange={handleItemRawSnapshotChange}
                  onDraftTitleChange={setCompletionDraftTitle}
                />
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddDraft}
          disabled={isSaving || isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-5" />
          <Typo.Body size="medium" className="font-medium">
            결과 화면 추가
          </Typo.Body>
        </button>
      </div>
    </div>
  );
}

export const CompletionSettingsCard = forwardRef<SectionSaveHandle, CompletionSettingsCardProps>(
  CompletionSettingsCardComponent,
);
CompletionSettingsCard.displayName = "CompletionSettingsCard";
