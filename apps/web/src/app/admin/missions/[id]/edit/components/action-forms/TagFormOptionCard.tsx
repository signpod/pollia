"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

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
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
        {index + 1}
      </div>

      <Input
        placeholder={titlePlaceholder}
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        disabled={disabled}
        className="h-9 text-sm flex-1"
      />

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
