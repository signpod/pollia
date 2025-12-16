"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { cn } from "@/app/admin/lib/utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const LIMITS = {
  title: 50,
  description: 200,
} as const;

function CharacterCounter({ current, max }: { current: number; max: number }) {
  const isOver = current > max;
  return (
    <span className={cn("text-xs", isOver ? "text-destructive" : "text-muted-foreground")}>
      {current}/{max}
    </span>
  );
}

export interface MultipleChoiceOptionCardProps {
  index: number;
  total: number;
  minOptions: number;
  title: string;
  description?: string;
  imagePreviewUrl?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  disabled?: boolean;
}

export function MultipleChoiceOptionCard({
  index,
  total,
  minOptions,
  title,
  description,
  imagePreviewUrl,
  titlePlaceholder = "제목",
  descriptionPlaceholder = "설명 (선택)",
  onTitleChange,
  onDescriptionChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onImageSelect,
  onImageDelete,
  disabled,
}: MultipleChoiceOptionCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const canDelete = total > minOptions;

  return (
    <Card className="mb-3 py-4 px-0">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
              {index + 1}
            </div>

            <ImageSelector
              size="medium"
              imageUrl={imagePreviewUrl}
              onImageSelect={onImageSelect}
              onImageDelete={onImageDelete}
              disabled={disabled}
            />
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="space-y-1">
              <Input
                placeholder={titlePlaceholder}
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                disabled={disabled}
                maxLength={LIMITS.title}
                className="h-9 text-sm"
              />
              <div className="flex justify-end">
                <CharacterCounter current={title.length} max={LIMITS.title} />
              </div>
            </div>
            <div className="space-y-1">
              <Input
                placeholder={descriptionPlaceholder}
                value={description || ""}
                onChange={e => onDescriptionChange(e.target.value)}
                disabled={disabled}
                maxLength={LIMITS.description}
                className="h-9 text-sm"
              />
              <div className="flex justify-end">
                <CharacterCounter current={description?.length || 0} max={LIMITS.description} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
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
        </div>
      </CardContent>
    </Card>
  );
}
