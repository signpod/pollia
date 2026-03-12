"use client";

import { Trash2 } from "lucide-react";

interface EditorDeleteSlotProps {
  onDelete: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function EditorDeleteSlot({
  onDelete,
  disabled = false,
  ariaLabel = "삭제",
}: EditorDeleteSlotProps) {
  return (
    <div className="flex shrink-0 items-center border-l border-zinc-200 px-2.5">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={event => {
          event.stopPropagation();
          onDelete();
        }}
        disabled={disabled}
        className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="size-5" />
      </button>
    </div>
  );
}
