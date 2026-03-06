"use client";

import {
  ActionForm,
  type ActionFormHandle,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import {
  makeDraftActionId,
  mapEditInitialValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { ActionType } from "@prisma/client";
import { Button, Typo } from "@repo/ui/components";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  GitBranch,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { type ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { ActionDeleteConfirmDialog } from "./ActionDeleteConfirmDialog";
import { FlowOverviewDialog } from "./FlowOverviewDialog";
import type { ActionSettingsCardProps } from "./actionSettingsCard.types";
import type { SectionSaveHandle } from "./editor-save.types";
import { useActionSettingsCard } from "./useActionSettingsCard";

export type { ActionSectionDraftSnapshot } from "./actionSettingsCard.types";

const NOOP = () => {};

function ActionSettingsCardComponent(
  props: ActionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const {
    viewState,
    listState,
    derived,
    formRefs,
    deleteDialog,
    flowDialog,
    handlers,
    saveHandle,
  } = useActionSettingsCard(props);

  useImperativeHandle(ref, () => saveHandle, [saveHandle]);

  const {
    isBusy,
    isActionsLoading,
    isFlowLoading,
    hasValidationIssues,
    validationIssueCount,
    isAiCompletionEnabled,
  } = viewState;

  const {
    orderedActionItems,
    openItemKey,
    actionTypeByItemKey,
    draftFormSnapshotByItemKey,
    existingFormVersionById,
    draftHydrationVersion,
  } = listState;

  const { completionOptions, linkTargets, referencedActionIdsBySource, flowAnalysis } = derived;

  const {
    handleAddDraft,
    handleRemoveDraft,
    handleToggleItem,
    handleActionTypeChange,
    handleMoveItem,
    handleItemDirtyChange,
    handleItemValidationChange,
    handleItemRawSnapshotChange,
  } = handlers;

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>진행 목록 수정</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              참여자가 수행할 질문을 추가하고 수정합니다.
            </Typo.Body>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasValidationIssues ? (
              <div
                className="flex items-center gap-1 text-red-500"
                title="입력 확인 필요"
                aria-label="입력 확인 필요"
              >
                <AlertCircle className="size-4" />
                <Typo.Body size="small" className="font-semibold text-red-500">
                  {validationIssueCount}
                </Typo.Body>
              </div>
            ) : null}
            <Button
              variant="secondary"
              className="h-10 px-4"
              inlineIcon
              leftIcon={<GitBranch className="size-4" />}
              onClick={() => flowDialog.onOpenChange(true)}
              disabled={isFlowLoading}
            >
              플로우
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        {isActionsLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.Body size="medium" className="text-zinc-500">
              로딩 중...
            </Typo.Body>
          </div>
        ) : orderedActionItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.SubTitle>아직 진행 목록이 없습니다</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-2 text-zinc-500">
              질문 추가 버튼으로 첫 질문을 생성해주세요.
            </Typo.Body>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orderedActionItems.map((item, index) => {
              const isOpen = openItemKey === item.key;
              const canMoveUp = index > 0;
              const canMoveDown = index < orderedActionItems.length - 1;
              const fallbackType =
                item.kind === "existing" ? item.action.type : ActionType.SUBJECTIVE;
              const itemType = actionTypeByItemKey[item.key] ?? fallbackType;
              const itemTitle =
                item.kind === "existing"
                  ? item.action.title
                  : `${ACTION_TYPE_LABELS[itemType]} 질문`;
              const currentActionId =
                item.kind === "existing" ? item.action.id : makeDraftActionId(item.draft.key);
              const formLinkTargets = linkTargets.filter(target => {
                if (target.id === currentActionId) return false;
                const sources = referencedActionIdsBySource.get(target.id);
                if (!sources) return true;
                if (sources.has(item.key)) return true;
                return false;
              });
              const previewImageUrl =
                formRefs.current[item.key]?.getRawSnapshot().values.imageUrl ??
                draftFormSnapshotByItemKey[item.key]?.values.imageUrl ??
                (item.kind === "existing" ? item.action.imageUrl : null);

              return (
                <div key={item.key} className="overflow-hidden rounded-xl border border-zinc-200">
                  <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                    <div className="mr-2 flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="위로 이동"
                        onClick={() => handleMoveItem(item.key, -1)}
                        disabled={isBusy || !canMoveUp}
                        className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="아래로 이동"
                        onClick={() => handleMoveItem(item.key, 1)}
                        disabled={isBusy || !canMoveDown}
                        className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.key)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Typo.Body size="medium" className="truncate font-semibold text-zinc-800">
                            {index + 1}. {itemTitle}
                          </Typo.Body>
                          {index === 0 ? (
                            <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
                              시작 질문
                            </span>
                          ) : null}
                        </div>
                        <Typo.Body size="small" className="mt-1 text-zinc-500">
                          {ACTION_TYPE_LABELS[itemType]}
                        </Typo.Body>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {previewImageUrl ? (
                          <img
                            src={previewImageUrl}
                            alt={`${itemTitle} 미리보기 이미지`}
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

                    {item.kind === "draft" ? (
                      <button
                        type="button"
                        aria-label="신규 질문 제거"
                        onClick={() => handleRemoveDraft(item.draft.key)}
                        className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:text-red-500"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="저장된 질문 삭제"
                        onClick={event => {
                          event.stopPropagation();
                          deleteDialog.onOpen(item.action);
                        }}
                        disabled={isBusy}
                        className="ml-2 rounded p-1 text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className={isOpen ? "block border-t border-zinc-200" : "hidden"}>
                    {item.kind === "existing" ? (
                      <ActionForm
                        key={`${item.key}:${existingFormVersionById[item.action.id] ?? 0}:${draftHydrationVersion}:${isAiCompletionEnabled}`}
                        ref={(instance: ActionFormHandle | null) => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        editingAction={item.action}
                        initialValues={
                          draftFormSnapshotByItemKey[item.key]?.values ??
                          mapEditInitialValues(item.action)
                        }
                        dirtyBaselineValues={mapEditInitialValues(item.action)}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        allowCompletionLink={!isAiCompletionEnabled}
                        isLoading={isBusy}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        enforceExclusiveNextLink
                        wordingMode="question"
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
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
                    ) : (
                      <ActionForm
                        key={`${item.key}:${draftHydrationVersion}:${isAiCompletionEnabled}`}
                        ref={(instance: ActionFormHandle | null) => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        initialValues={draftFormSnapshotByItemKey[item.key]?.values}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        allowCompletionLink={!isAiCompletionEnabled}
                        isLoading={isBusy}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        enforceExclusiveNextLink
                        wordingMode="question"
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddDraft}
          disabled={isBusy || isActionsLoading}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-5" />
          <Typo.Body size="medium" className="font-medium">
            질문 추가
          </Typo.Body>
        </button>
      </div>

      <FlowOverviewDialog
        open={flowDialog.isOpen}
        onOpenChange={flowDialog.onOpenChange}
        analysis={flowAnalysis}
        isLoading={isFlowLoading}
        errorMessage={viewState.flowErrorMessage}
      />

      <ActionDeleteConfirmDialog
        target={deleteDialog.target}
        isPending={deleteDialog.isPending}
        onClose={deleteDialog.onClose}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}

export const ActionSettingsCard = forwardRef<SectionSaveHandle, ActionSettingsCardProps>(
  ActionSettingsCardComponent,
);
ActionSettingsCard.displayName = "ActionSettingsCard";
