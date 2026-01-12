"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { getActionTypeLabel } from "@/app/admin/constants/actionTypes";
import type { ActionDetail } from "@/types/dto/action";
import {
  type ActionFormData,
  DateForm,
  ImageUploadForm,
  MultipleChoiceForm,
  PdfUploadForm,
  PrivacyConsentForm,
  RatingForm,
  ScaleForm,
  ShortTextForm,
  SubjectiveForm,
  TagForm,
  TimeForm,
  VideoUploadForm,
} from "./action-forms";

interface EditActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionDetail | null;
  onSubmit: (data: ActionFormData) => void;
  isLoading?: boolean;
}

export function EditActionDialog({
  open,
  onOpenChange,
  action,
  onSubmit,
  isLoading = false,
}: EditActionDialogProps) {
  const handleFormSubmit = (data: ActionFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{getActionTypeLabel(action.type)} 액션 수정</DialogTitle>
          <DialogDescription>액션의 세부 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <div className="py-2 max-h-[80vh] overflow-y-auto pr-2 -mr-2">
          <ActionForm
            action={action}
            isLoading={isLoading}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ActionFormProps {
  action: ActionDetail;
  isLoading: boolean;
  onSubmit: (data: ActionFormData) => void;
  onCancel: () => void;
}

function ActionForm({ action, isLoading, onSubmit, onCancel }: ActionFormProps) {
  const mapOptions = (options: typeof action.options) =>
    options?.map(opt => ({
      title: opt.title,
      description: opt.description || undefined,
      imageUrl: opt.imageUrl || undefined,
    })) || [];

  switch (action.type) {
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
            hasOther: action.hasOther,
            maxSelections: action.maxSelections ?? 1,
            options: mapOptions(action.options),
          }}
        />
      );
    case "SCALE":
      return (
        <ScaleForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
            options: mapOptions(action.options),
          }}
        />
      );
    case "RATING":
      return (
        <RatingForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
          }}
        />
      );
    case "TAG":
      return (
        <TagForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
            maxSelections: action.maxSelections ?? 1,
            options: mapOptions(action.options),
          }}
        />
      );
    case "SUBJECTIVE":
      return (
        <SubjectiveForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
          }}
        />
      );
    case "SHORT_TEXT":
      return (
        <ShortTextForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
          }}
        />
      );
    case "IMAGE":
      return (
        <ImageUploadForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
            maxSelections: action.maxSelections ?? undefined,
          }}
        />
      );
    case "PDF":
      return (
        <PdfUploadForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
          }}
        />
      );
    case "VIDEO":
      return (
        <VideoUploadForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
          }}
        />
      );
    case "PRIVACY_CONSENT":
      return (
        <PrivacyConsentForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
          }}
        />
      );
    case "DATE":
      return (
        <DateForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
            maxSelections: action.maxSelections ?? undefined,
          }}
        />
      );
    case "TIME":
      return (
        <TimeForm
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={{
            title: action.title,
            description: action.description || undefined,
            imageUrl: action.imageUrl || undefined,
            isRequired: action.isRequired,
            maxSelections: action.maxSelections ?? undefined,
          }}
        />
      );
    default:
      return null;
  }
}
