"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { Typo } from "@repo/ui/components";
import { useAtom } from "jotai";
import { AlertCircle, Plus } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { completionScrollTargetItemKeyAtom } from "../atoms/editorCompletionAtoms";
import type { CompletionFormHandle } from "./CompletionForm";
import { CompletionItem } from "./CompletionItem";
import type { CompletionSettingsCardProps } from "./completionSettingsCard.types";
import type { SectionSaveHandle } from "./editor-save.types";
import { useCompletionSettingsCard } from "./useCompletionSettingsCard";

export type { CompletionSectionDraftSnapshot } from "./completionSettingsCard.types";

function CompletionSettingsCardComponent(
  props: CompletionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const { viewState, listState, formRefs, handlers, saveHandle } = useCompletionSettingsCard(props);

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
