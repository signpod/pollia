"use client";

import { Typo } from "@repo/ui/components";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";

interface NextLinkTarget {
  id: string;
  title: string;
  order: number | null;
}

interface CompletionOption {
  id: string;
  title: string;
}

interface NextLinkDisplayProps {
  itemLabel: string;
  nextActionId: string | null;
  nextCompletionId: string | null;
  selectableActions: NextLinkTarget[];
  completionOptions: CompletionOption[];
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  errorMessage?: string;
}

export function NextLinkDisplay({
  itemLabel,
  nextActionId,
  nextCompletionId,
  selectableActions,
  completionOptions,
  onAdd,
  onEdit,
  onDelete,
  errorMessage,
}: NextLinkDisplayProps) {
  const linkedAction = nextActionId ? selectableActions.find(a => a.id === nextActionId) : null;
  const linkedCompletion = nextCompletionId
    ? completionOptions.find(c => c.id === nextCompletionId)
    : null;
  const hasLink = Boolean(linkedAction || linkedCompletion || nextActionId || nextCompletionId);

  if (!hasLink) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-500"
        >
          <Plus className="size-4" />
          다음 이동 추가
        </button>
        {errorMessage && (
          <Typo.Body size="small" className="text-red-500">
            {errorMessage}
          </Typo.Body>
        )}
      </div>
    );
  }

  const displayLabel = linkedAction
    ? `#${(linkedAction.order ?? 0) + 1} ${linkedAction.title}`
    : linkedCompletion
      ? linkedCompletion.title
      : nextActionId
        ? `연결된 ${itemLabel} (ID: ${nextActionId.slice(0, 8)}...)`
        : `연결된 결과 화면 (ID: ${nextCompletionId?.slice(0, 8)}...)`;
  const typeLabel =
    linkedAction || (nextActionId && !linkedCompletion) ? `다음 ${itemLabel}` : "결과 화면";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2.5">
        <ArrowRight className="size-4 shrink-0 text-violet-500" />
        <div className="min-w-0 flex-1">
          <Typo.Body size="small" className="text-violet-600">
            {typeLabel}
          </Typo.Body>
          <Typo.Body size="medium" className="truncate font-medium text-zinc-800">
            {displayLabel}
          </Typo.Body>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-violet-100 hover:text-violet-600"
            aria-label="다음 이동 수정"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="다음 이동 삭제"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {errorMessage && (
        <Typo.Body size="small" className="text-red-500">
          {errorMessage}
        </Typo.Body>
      )}
    </div>
  );
}
