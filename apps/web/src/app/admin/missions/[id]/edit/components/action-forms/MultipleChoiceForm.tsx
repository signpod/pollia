"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BaseActionForm } from "./BaseActionForm";
import type {
  ActionFormProps,
  ActionOptionInput,
  BaseActionFormData,
  MultipleChoiceFormData,
} from "./types";

interface OptionWithId extends ActionOptionInput {
  id: string;
  imageFile?: File;
  imagePreviewUrl?: string;
}

interface OptionCardProps {
  option: OptionWithId;
  index: number;
  total: number;
  onUpdate: (id: string, data: Partial<OptionWithId>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onImageSelect: (id: string, file: File) => void;
  onImageDelete: (id: string) => void;
  disabled?: boolean;
}

function OptionCard({
  option,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onImageSelect,
  onImageDelete,
  disabled,
}: OptionCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

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
              imageUrl={option.imagePreviewUrl}
              onImageSelect={file => onImageSelect(option.id, file)}
              onImageDelete={() => onImageDelete(option.id)}
              disabled={disabled}
            />
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <Input
              placeholder="선택지 제목"
              value={option.title}
              onChange={e => onUpdate(option.id, { title: e.target.value })}
              disabled={disabled}
              className="h-9 text-sm"
            />
            <Input
              placeholder="선택지 설명 (선택)"
              value={option.description || ""}
              onChange={e => onUpdate(option.id, { description: e.target.value })}
              disabled={disabled}
              className="h-9 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(option.id)}
              disabled={disabled || isFirst}
              className="size-8"
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(option.id)}
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
            onClick={() => onDelete(option.id)}
            disabled={disabled}
            className="size-8 text-destructive hover:text-destructive shrink-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MultipleChoiceForm({
  isLoading = false,
  onSubmit,
  onCancel,
}: ActionFormProps<MultipleChoiceFormData>) {
  const [options, setOptions] = useState<OptionWithId[]>([]);

  const handleSubmit = (baseData: BaseActionFormData) => {
    const formattedOptions: ActionOptionInput[] = options.map(opt => ({
      title: opt.title,
      description: opt.description || undefined,
      imageUrl: opt.imagePreviewUrl || undefined,
    }));

    onSubmit({
      ...baseData,
      type: "MULTIPLE_CHOICE",
      options: formattedOptions,
    });
  };

  const handleAddOption = () => {
    const newOption: OptionWithId = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
    };
    setOptions(prev => [...prev, newOption]);
  };

  const handleUpdateOption = (id: string, data: Partial<OptionWithId>) => {
    setOptions(prev => prev.map(opt => (opt.id === id ? { ...opt, ...data } : opt)));
  };

  const handleDeleteOption = (id: string) => {
    const option = options.find(opt => opt.id === id);
    if (option?.imagePreviewUrl) {
      URL.revokeObjectURL(option.imagePreviewUrl);
    }
    setOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleMoveUp = (id: string) => {
    setOptions(prev => {
      const index = prev.findIndex(opt => opt.id === id);
      if (index <= 0) return prev;
      const current = prev[index];
      const above = prev[index - 1];
      if (!current || !above) return prev;
      return prev.map((opt, i) => {
        if (i === index - 1) return current;
        if (i === index) return above;
        return opt;
      });
    });
  };

  const handleMoveDown = (id: string) => {
    setOptions(prev => {
      const index = prev.findIndex(opt => opt.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const current = prev[index];
      const below = prev[index + 1];
      if (!current || !below) return prev;
      return prev.map((opt, i) => {
        if (i === index) return below;
        if (i === index + 1) return current;
        return opt;
      });
    });
  };

  const handleImageSelect = (id: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setOptions(prev =>
      prev.map(opt =>
        opt.id === id
          ? {
              ...opt,
              imageFile: file,
              imagePreviewUrl: previewUrl,
            }
          : opt,
      ),
    );
  };

  const handleImageDelete = (id: string) => {
    const option = options.find(opt => opt.id === id);
    if (option?.imagePreviewUrl) {
      URL.revokeObjectURL(option.imagePreviewUrl);
    }
    setOptions(prev =>
      prev.map(opt =>
        opt.id === id
          ? {
              ...opt,
              imageFile: undefined,
              imagePreviewUrl: undefined,
              imageUrl: undefined,
            }
          : opt,
      ),
    );
  };

  const isFormValid = (_baseData: BaseActionFormData) => {
    return options.length > 0 && options.every(opt => opt.title.trim().length > 0);
  };

  return (
    <BaseActionForm
      titlePlaceholder="예: 가장 선호하는 옵션을 선택해주세요."
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isValid={isFormValid}
    >
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          선택지 <span className="text-destructive">*</span>
        </Label>

        {options.length > 0 ? (
          <div>
            {options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                index={index}
                total={options.length}
                onUpdate={handleUpdateOption}
                onDelete={handleDeleteOption}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onImageSelect={handleImageSelect}
                onImageDelete={handleImageDelete}
                disabled={isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
            <p className="text-sm">선택지가 없습니다.</p>
            <p className="text-xs mt-1">아래 버튼을 눌러 선택지를 추가하세요.</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAddOption}
          disabled={isLoading}
        >
          <Plus className="size-4 mr-2" />
          선택지 추가
        </Button>
      </div>
    </BaseActionForm>
  );
}
