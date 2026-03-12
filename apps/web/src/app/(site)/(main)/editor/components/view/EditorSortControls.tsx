"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

interface EditorSortControlsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
}

const SORT_BUTTON_CLASS =
  "flex flex-1 items-center justify-center px-3 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-200 disabled:hover:bg-transparent";

export function EditorSortControls({
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  disabled = false,
  attributes,
  listeners,
}: EditorSortControlsProps) {
  return (
    <>
      <div
        className="flex shrink-0 cursor-grab items-center border-r border-zinc-200 px-3 text-zinc-400 hover:text-zinc-600 active:cursor-grabbing"
        style={{ touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </div>

      <div className="flex shrink-0 flex-col border-r border-zinc-200">
        <button
          type="button"
          aria-label="위로 이동"
          onClick={onMoveUp}
          disabled={isFirst || disabled}
          className={`${SORT_BUTTON_CLASS} border-b border-zinc-200`}
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          aria-label="아래로 이동"
          onClick={onMoveDown}
          disabled={isLast || disabled}
          className={SORT_BUTTON_CLASS}
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </>
  );
}
