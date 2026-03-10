"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { Typo } from "@repo/ui/components";
import { AlertCircle, ChevronDown, Plus, X } from "lucide-react";
import { type ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { CompletionForm, type CompletionFormHandle } from "./CompletionForm";
import type { CompletionSettingsCardProps } from "./completionSettingsCard.types";
import { mapEditInitialValues } from "./completionSettingsCard.utils";
import type { SectionSaveHandle } from "./editor-save.types";
import { useCompletionSettingsCard } from "./useCompletionSettingsCard";

export type { CompletionSectionDraftSnapshot } from "./completionSettingsCard.types";

const NOOP = () => {};

function CompletionSettingsCardComponent(
  props: CompletionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const { viewState, listState, formRefs, handlers, saveHandle } = useCompletionSettingsCard(props);

  useImperativeHandle(ref, () => saveHandle, [saveHandle]);

  const { isSaving, isLoading, hasValidationIssues, validationIssueCount } = viewState;

  const {
    completionItems,
    openItemKey,
    draftFormSnapshotByItemKey,
    existingFormVersionById,
    draftHydrationVersion,
  } = listState;

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

      <div className="flex flex-col gap-4 px-5 py-5">
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
              const isOpen = openItemKey === item.key;
              const currentSnapshot =
                formRefs.current[item.key]?.getRawSnapshot() ??
                draftFormSnapshotByItemKey[item.key];
              const snapshotTitle = currentSnapshot?.title?.trim() ?? "";
              const title =
                item.kind === "existing"
                  ? snapshotTitle || item.completion.title
                  : snapshotTitle || (item.draft.title.trim() ?? "") || "새 결과 화면";
              const previewImageUrl =
                currentSnapshot?.imageUrl ??
                (item.kind === "existing" ? item.completion.imageUrl : null);

              return (
                <div
                  key={item.key}
                  data-editor-item-key={item.key}
                  className="overflow-hidden rounded-xl border border-zinc-200"
                >
                  <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.key)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <Typo.Body size="medium" className="truncate font-semibold text-zinc-800">
                          {index + 1}. {title}
                        </Typo.Body>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {previewImageUrl ? (
                          <img
                            src={previewImageUrl}
                            alt={`${title} 미리보기 이미지`}
                            className="size-10 shrink-0 rounded border border-zinc-200 bg-zinc-100 object-cover"
                          />
                        ) : null}
                        <ChevronDown
                          className={`size-4 shrink-0 text-zinc-500 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      aria-label={
                        item.kind === "existing" ? "결과 화면 제거" : "신규 결과 화면 제거"
                      }
                      onClick={() =>
                        item.kind === "existing"
                          ? handleRemoveExisting(item.completion.id)
                          : handleRemoveDraft(item.draft.key)
                      }
                      className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:text-red-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className={isOpen ? "block border-t border-zinc-200" : "hidden"}>
                    <CompletionForm
                      key={
                        item.kind === "existing"
                          ? `${item.key}:${existingFormVersionById[item.completion.id] ?? 0}:${draftHydrationVersion}`
                          : `${item.key}:${draftHydrationVersion}`
                      }
                      ref={(instance: CompletionFormHandle | null) => {
                        formRefs.current[item.key] = instance;
                        if (item.kind === "draft") {
                          registerCompletionDraftForm(item.draft.key, instance);
                        }
                      }}
                      missionId={props.missionId}
                      itemKey={item.key}
                      initialValues={
                        draftFormSnapshotByItemKey[item.key] ??
                        (item.kind === "existing"
                          ? mapEditInitialValues(item.completion)
                          : undefined)
                      }
                      dirtyBaselineValues={
                        item.kind === "existing" ? mapEditInitialValues(item.completion) : undefined
                      }
                      isLoading={isSaving}
                      onSubmit={NOOP}
                      onCancel={NOOP}
                      hideTitle
                      hideFooter
                      onTitleChange={
                        item.kind === "draft"
                          ? titleValue => setCompletionDraftTitle(item.draft.key, titleValue)
                          : undefined
                      }
                      onDirtyChange={isDirty => {
                        handleItemDirtyChange(item.key, isDirty);
                      }}
                      onValidationStateChange={issueCount => {
                        handleItemValidationChange(item.key, issueCount);
                      }}
                      onRawSnapshotChange={snapshot => {
                        handleItemRawSnapshotChange(item.key, snapshot);
                      }}
                    />
                  </div>
                </div>
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
