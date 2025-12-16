"use client";

import { InputWithCounter } from "@/app/admin/components/common/InputField";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const LIMITS = {
  title: 50,
  description: 200,
} as const;

export interface ScaleFormOptionCardProps {
  index: number;
  total: number;
  minOptions: number;
  title: string;
  description?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function ScaleFormOptionCard({
  index,
  total,
  minOptions,
  title,
  description,
  titlePlaceholder = "제목",
  descriptionPlaceholder = "설명 (선택)",
  onTitleChange,
  onDescriptionChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  disabled,
}: ScaleFormOptionCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const canDelete = total > minOptions;

  return (
    <Card className="mb-3 py-4 px-0">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
            {index + 1}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <InputWithCounter
              placeholder={titlePlaceholder}
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              disabled={disabled}
              maxLength={LIMITS.title}
              currentLength={title.length}
              className="h-9 text-sm"
            />
            <InputWithCounter
              placeholder={descriptionPlaceholder}
              value={description || ""}
              onChange={e => onDescriptionChange(e.target.value)}
              disabled={disabled}
              maxLength={LIMITS.description}
              currentLength={description?.length || 0}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={disabled || !canDelete}
              className="size-8 text-destructive hover:text-destructive shrink-0 disabled:text-muted-foreground"
            >
              <Trash2 className="size-4" />
            </Button>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
