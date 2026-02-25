"use client";

import { ACTION_TYPE_LABELS } from "@/constants/action";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  GitBranch,
  ImageIcon,
  Pencil,
  Scale,
  Star,
  Tag,
  TextCursor,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActionCardProps {
  action: ActionDetail;
  index: number;
  total: number;
  allActions: ActionDetail[];
  onEdit: (action: ActionDetail) => void;
  onDelete: (action: ActionDetail) => void;
  onMoveUp: (action: ActionDetail) => void;
  onMoveDown: (action: ActionDetail) => void;
}

const TYPE_ICONS: Record<ActionType, LucideIcon> = {
  [ActionType.MULTIPLE_CHOICE]: CheckSquare,
  [ActionType.SHORT_TEXT]: Type,
  [ActionType.SUBJECTIVE]: TextCursor,
  [ActionType.SCALE]: Scale,
  [ActionType.RATING]: Star,
  [ActionType.TAG]: Tag,
  [ActionType.IMAGE]: ImageIcon,
  [ActionType.VIDEO]: Video,
  [ActionType.PDF]: FileText,
  [ActionType.DATE]: Calendar,
  [ActionType.TIME]: Clock,
  [ActionType.BRANCH]: GitBranch,
};

const TYPE_COLORS: Record<ActionType, string> = {
  [ActionType.MULTIPLE_CHOICE]: "text-blue-500 bg-blue-50",
  [ActionType.SHORT_TEXT]: "text-emerald-500 bg-emerald-50",
  [ActionType.SUBJECTIVE]: "text-green-500 bg-green-50",
  [ActionType.SCALE]: "text-purple-500 bg-purple-50",
  [ActionType.RATING]: "text-yellow-500 bg-yellow-50",
  [ActionType.TAG]: "text-pink-500 bg-pink-50",
  [ActionType.IMAGE]: "text-orange-500 bg-orange-50",
  [ActionType.VIDEO]: "text-violet-500 bg-violet-50",
  [ActionType.PDF]: "text-red-500 bg-red-50",
  [ActionType.DATE]: "text-cyan-500 bg-cyan-50",
  [ActionType.TIME]: "text-indigo-500 bg-indigo-50",
  [ActionType.BRANCH]: "text-amber-500 bg-amber-50",
};

function getNextLabel(action: ActionDetail, allActions: ActionDetail[]): string | null {
  if (action.type === ActionType.BRANCH) {
    const missingCount = action.options.filter(opt => !opt.nextActionId).length;
    if (missingCount > 0) return `분기 옵션 ${missingCount}개 미연결`;
    return null;
  }

  if (action.nextActionId) {
    const target = allActions.find(a => a.id === action.nextActionId);
    return target ? `다음: ${target.title}` : null;
  }

  if (action.nextCompletionId) {
    return "완료 화면으로 이동";
  }

  return "다음 이동 미설정";
}

export function ActionCard({
  action,
  index,
  total,
  allActions,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ActionCardProps) {
  const Icon = TYPE_ICONS[action.type] ?? FileText;
  const colorClass = TYPE_COLORS[action.type] ?? "text-gray-500 bg-gray-50";
  const [iconColor, bgColor] = colorClass.split(" ");
  const nextLabel = getNextLabel(action, allActions);
  const isNextMissing = nextLabel === "다음 이동 미설정" || nextLabel?.includes("미연결");

  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <button
          type="button"
          onClick={() => onMoveUp(action)}
          disabled={index === 0}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-50 disabled:opacity-30"
        >
          <ChevronUp className="size-4" />
        </button>
        <Typo.Body size="small" className="font-semibold text-zinc-500">
          {index + 1}
        </Typo.Body>
        <button
          type="button"
          onClick={() => onMoveDown(action)}
          disabled={index === total - 1}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-50 disabled:opacity-30"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className={`rounded-md p-1.5 ${bgColor}`}>
            <Icon className={`size-4 ${iconColor}`} />
          </span>
          <Typo.Body size="small" className="text-zinc-400">
            {ACTION_TYPE_LABELS[action.type]}
          </Typo.Body>
          {action.isRequired && (
            <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
              필수
            </span>
          )}
        </div>

        <Typo.Body size="medium" className="truncate font-medium text-zinc-900">
          {action.title}
        </Typo.Body>

        {nextLabel && (
          <Typo.Body size="small" className={isNextMissing ? "text-red-500" : "text-zinc-400"}>
            {nextLabel}
          </Typo.Body>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => onEdit(action)}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(action)}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-red-500"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
