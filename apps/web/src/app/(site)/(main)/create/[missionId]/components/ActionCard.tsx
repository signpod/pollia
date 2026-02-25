"use client";

import { getActionTypeInfo } from "@/app/admin/missions/[id]/components/mission-tab-action-list-content/action-type-info";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { cn } from "@/lib/utils";
import { ButtonV2, Typo } from "@repo/ui/components";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PreviewAction } from "../context/EditorContext";
import { ActionEditor } from "./ActionEditor";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface ActionCardProps {
  action: PreviewAction;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUpdate: (action: PreviewAction) => void;
}

export function ActionCard({
  action,
  index,
  total,
  isOpen,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate,
}: ActionCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const typeInfo = getActionTypeInfo(action.type);

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-white transition-colors",
          isOpen ? "border-zinc-300 shadow-sm" : "border-zinc-200 hover:border-zinc-300",
        )}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: div required to avoid nested button (invalid HTML) */}
        <div
          role="button"
          tabIndex={0}
          className="flex w-full cursor-pointer items-center gap-2 p-4 text-left"
          onClick={onToggle}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          aria-expanded={isOpen}
        >
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-zinc-400" aria-hidden>
              <GripVertical className="h-4 w-4" />
            </span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
              {index + 1}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <Typo.Body size="medium" className="font-medium text-zinc-900 truncate">
              {action.title || "질문 제목 없음"}
            </Typo.Body>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
                  typeInfo.bgColor,
                  typeInfo.color,
                )}
              >
                {ACTION_TYPE_LABELS[action.type] ?? action.type}
              </span>
              {action.nextCompletionId && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                  결과 연결됨
                </span>
              )}
            </div>
          </div>
          <div
            className="flex shrink-0 items-center gap-0.5"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            role="group"
          >
            <ButtonV2
              variant="tertiary"
              size="medium"
              className="h-8 w-8 p-0"
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label="위로"
            >
              <ChevronUp className="h-4 w-4" />
            </ButtonV2>
            <ButtonV2
              variant="tertiary"
              size="medium"
              className="h-8 w-8 p-0"
              onClick={onMoveDown}
              disabled={index === total - 1}
              aria-label="아래로"
            >
              <ChevronDown className="h-4 w-4" />
            </ButtonV2>
            <ButtonV2
              variant="tertiary"
              size="medium"
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteModal(true)}
              aria-label="삭제"
            >
              <Trash2 className="h-4 w-4" />
            </ButtonV2>
            <span className="ml-1 flex h-8 w-8 items-center justify-center text-zinc-400">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>
        </div>
        {isOpen && (
          <div className="border-t border-zinc-100 p-4">
            <ActionEditor action={action} onUpdate={onUpdate} />
          </div>
        )}
      </div>
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="질문 삭제"
        description="이 질문을 삭제할까요? 되돌릴 수 없습니다."
        onConfirm={onDelete}
      />
    </>
  );
}
