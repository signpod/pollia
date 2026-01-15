"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/admin/components/shadcn-ui/radio-group";
import { ACTION_TYPE_CONFIGS } from "@/app/admin/config/actionTypes";
import { cn } from "@/app/admin/lib/utils";
import { useState } from "react";
import {
  type ActionFormData,
  type ActionType,
  DateForm,
  ImageUploadForm,
  MultipleChoiceForm,
  PdfUploadForm,
  RatingForm,
  ScaleForm,
  ShortTextForm,
  SubjectiveForm,
  TagForm,
  TimeForm,
  VideoUploadForm,
} from "./action-forms";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActionFormData) => void;
  isLoading?: boolean;
}

type Step = "select-type" | "form";

export function CreateActionDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateActionDialogProps) {
  const [step, setStep] = useState<Step>("select-type");
  const [selectedType, setSelectedType] = useState<ActionType>("MULTIPLE_CHOICE");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("select-type");
      setSelectedType("MULTIPLE_CHOICE");
    }
    onOpenChange(open);
  };

  const handleTypeSelect = () => {
    setStep("form");
  };

  const handleBack = () => {
    setStep("select-type");
  };

  const handleFormSubmit = (data: ActionFormData) => {
    onSubmit(data);
    handleOpenChange(false);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const selectedTypeConfig = ACTION_TYPE_CONFIGS.find(t => t.value === selectedType);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {step === "select-type" ? "새 액션 추가" : `${selectedTypeConfig?.label} 액션 추가`}
          </DialogTitle>
          <DialogDescription>
            {step === "select-type"
              ? "추가할 액션의 유형을 선택하세요."
              : "액션의 세부 정보를 입력하세요."}
          </DialogDescription>
        </DialogHeader>

        {step === "select-type" ? (
          <div className="py-4">
            <Label className="text-sm font-medium mb-3 block">액션 유형</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={value => setSelectedType(value as ActionType)}
              className="grid grid-cols-2 gap-3"
            >
              {ACTION_TYPE_CONFIGS.map(actionType => {
                const Icon = actionType.icon;
                const isSelected = selectedType === actionType.value;
                return (
                  <label
                    key={actionType.value}
                    htmlFor={actionType.value}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                      "hover:bg-muted/50",
                      isSelected && "border-primary bg-primary/5",
                    )}
                  >
                    <RadioGroupItem
                      value={actionType.value}
                      id={actionType.value}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex items-center justify-center size-8 rounded-md",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <span className="font-medium text-sm">{actionType.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {actionType.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button type="button" onClick={handleTypeSelect}>
                다음
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-2 max-h-[80vh] overflow-y-auto pr-2 -mr-2">
            <ActionForm
              type={selectedType}
              isLoading={isLoading}
              onSubmit={handleFormSubmit}
              onCancel={handleBack}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ActionFormProps {
  type: ActionType;
  isLoading: boolean;
  onSubmit: (data: ActionFormData) => void;
  onCancel: () => void;
}

function ActionForm({ type, isLoading, onSubmit, onCancel }: ActionFormProps) {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return <MultipleChoiceForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "SCALE":
      return <ScaleForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "RATING":
      return <RatingForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "TAG":
      return <TagForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "SUBJECTIVE":
      return <SubjectiveForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "SHORT_TEXT":
      return <ShortTextForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "IMAGE":
      return <ImageUploadForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "PDF":
      return <PdfUploadForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "VIDEO":
      return <VideoUploadForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "DATE":
      return <DateForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    case "TIME":
      return <TimeForm isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} />;
    default:
      return null;
  }
}
