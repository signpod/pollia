"use client";

import { InputWithCounter } from "@/app/admin/components/common/InputField";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const LIMITS = {
  title: 50,
} as const;

export interface TagFormOptionCardProps {
  index: number;
  total: number;
  minOptions: number;
  title: string;
  titlePlaceholder?: string;
  onTitleChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function TagFormOptionCard({
  index,
  total,
  minOptions,
  title,
  titlePlaceholder = "제목",
  onTitleChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  disabled,
}: TagFormOptionCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const canDelete = total > minOptions;

  return (
    <div className="flex items-center-safe gap-3">
      <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 mt-6">
        <InputWithCounter
          placeholder={titlePlaceholder}
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          disabled={disabled}
          maxLength={LIMITS.title}
          currentLength={title.length}
          className="h-9 text-sm flex-1"
        />
      </div>

      <div className="flex gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={disabled || isFirst}
          className="size-8"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={disabled || isLast}
          className="size-8"
        >
          <ChevronDown className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={disabled || !canDelete}
          className="size-8 text-destructive hover:text-destructive disabled:text-muted-foreground"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
