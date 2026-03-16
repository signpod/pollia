"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { cn } from "@/app/admin/lib/utils";
import {
  ACTION_OPTION_DESCRIPTION_MAX_LENGTH,
  ACTION_OPTION_TITLE_MAX_LENGTH,
} from "@/schemas/action";

export interface BranchOptionCardProps {
  index: number;
  title: string;
  description?: string | null;
  imagePreviewUrl?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  disabled?: boolean;
}

export function BranchOptionCard({
  index,
  title,
  description,
  imagePreviewUrl,
  titlePlaceholder = "제목",
  descriptionPlaceholder = "설명 (선택)",
  onTitleChange,
  onDescriptionChange,
  onImageSelect,
  onImageDelete,
  disabled,
}: BranchOptionCardProps) {
  return (
    <Card className="mb-3 py-4 px-0">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-2 items-start relative">
            <div
              className={cn(
                "flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0",
                "absolute -top-2 -left-2 z-10",
              )}
            >
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
                maxLength={ACTION_OPTION_TITLE_MAX_LENGTH}
                className="h-9 text-sm"
              />
              <div className="flex justify-end">
                <CharacterCounter current={title.length} max={ACTION_OPTION_TITLE_MAX_LENGTH} />
              </div>
            </div>
            <div className="space-y-1">
              <Input
                placeholder={descriptionPlaceholder}
                value={description || ""}
                onChange={e => onDescriptionChange(e.target.value)}
                disabled={disabled}
                maxLength={ACTION_OPTION_DESCRIPTION_MAX_LENGTH}
                className="h-9 text-sm"
              />
              <div className="flex justify-end">
                <CharacterCounter
                  current={description?.length || 0}
                  max={ACTION_OPTION_DESCRIPTION_MAX_LENGTH}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
