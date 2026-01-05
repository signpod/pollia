"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { TiptapEditor } from "@/app/admin/components/common/TiptapEditor";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { useAdminSingleImage } from "@/app/admin/hooks/use-admin-image-upload";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
} from "@/schemas/mission-completion/missionCompletionSchema";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { CreateMissionFunnelFormData } from "../schemas";

interface CompletionStepProps {
  form: UseFormReturn<CreateMissionFunnelFormData>;
}

function LinksSection({ form }: { form: UseFormReturn<CreateMissionFunnelFormData> }) {
  const completion = form.watch("completion");
  const links = completion?.links || {};
  const linkEntries = Object.entries(links);
  const [newLinkKey, setNewLinkKey] = useState("");
  const [newLinkValue, setNewLinkValue] = useState("");

  const handleAddLink = () => {
    if (!newLinkKey.trim() || !newLinkValue.trim()) {
      toast.error("링크 이름과 URL을 모두 입력해주세요.");
      return;
    }

    try {
      new URL(newLinkValue);
    } catch {
      toast.error("올바른 URL 형식이 아닙니다.");
      return;
    }

    const currentLinks = completion?.links || {};
    const updatedCompletion: CreateMissionFunnelFormData["completion"] = {
      ...completion,
      links: { ...currentLinks, [newLinkKey.trim()]: newLinkValue.trim() },
    };
    form.setValue("completion", updatedCompletion, { shouldDirty: true });
    setNewLinkKey("");
    setNewLinkValue("");
  };

  const handleRemoveLink = (key: string) => {
    const currentLinks = completion?.links || {};
    const { [key]: _, ...rest } = currentLinks;
    const updatedCompletion: CreateMissionFunnelFormData["completion"] = {
      ...completion,
      links: Object.keys(rest).length > 0 ? rest : undefined,
    };
    form.setValue("completion", updatedCompletion, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      {linkEntries.length > 0 && (
        <div className="space-y-2">
          {linkEntries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-1">{key}</div>
                <div className="text-sm text-foreground truncate">{value}</div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveLink(key)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="링크 이름"
          value={newLinkKey}
          onChange={e => setNewLinkKey(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLink();
            }
          }}
        />
        <Input
          placeholder="URL"
          type="url"
          value={newLinkValue}
          onChange={e => setNewLinkValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLink();
            }
          }}
        />
        <Button type="button" onClick={handleAddLink}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function CompletionStep({ form }: CompletionStepProps) {
  const imageUpload = useAdminSingleImage({
    onUploadSuccess: data => {
      const currentCompletion = form.getValues("completion");
      form.setValue(
        "completion",
        {
          ...currentCompletion,
          imageUrl: data.publicUrl,
          imageFileUploadId: data.fileUploadId,
        },
        { shouldDirty: true },
      );
    },
  });

  const completion = form.watch("completion");
  const completionTitle = completion?.title || "";
  const completionDescription = completion?.description || "";
  const completionImageUrl = imageUpload.previewUrl || completion?.imageUrl || undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>완료 화면 정보</CardTitle>
          <CardDescription>미션 완료 시 표시될 화면의 제목과 설명을 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="completion-title">
                제목 <span className="text-destructive">*</span>
              </Label>
              <CharacterCounter
                current={completionTitle?.length || 0}
                max={MISSION_COMPLETION_TITLE_MAX_LENGTH}
              />
            </div>
            <Input
              id="completion-title"
              placeholder="예: 미션을 완료하셨습니다!"
              value={completionTitle}
              onChange={e => {
                const value = e.target.value;
                const currentDescription = completion?.description || "";
                form.setValue(
                  "completion",
                  {
                    title: value,
                    description: currentDescription,
                    ...(completion?.imageUrl && { imageUrl: completion.imageUrl }),
                    ...(completion?.imageFileUploadId && {
                      imageFileUploadId: completion.imageFileUploadId,
                    }),
                    ...(completion?.links && { links: completion.links }),
                  },
                  {
                    shouldDirty: true,
                  },
                );
              }}
              maxLength={MISSION_COMPLETION_TITLE_MAX_LENGTH}
            />
            {form.formState.errors.completion?.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.completion.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="completion-description">
                설명 <span className="text-destructive">*</span>
              </Label>
              <CharacterCounter
                current={completionDescription?.length || 0}
                max={MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <TiptapEditor
              content={completionDescription}
              onUpdate={content => {
                const currentTitle = completion?.title || "";
                form.setValue(
                  "completion",
                  {
                    title: currentTitle,
                    description: content || "",
                    ...(completion?.imageUrl && { imageUrl: completion.imageUrl }),
                    ...(completion?.imageFileUploadId && {
                      imageFileUploadId: completion.imageFileUploadId,
                    }),
                    ...(completion?.links && { links: completion.links }),
                  },
                  {
                    shouldDirty: true,
                  },
                );
              }}
              placeholder="완료 화면에 표시될 설명을 입력하세요."
            />
            {form.formState.errors.completion?.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.completion.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>이미지</CardTitle>
          <CardDescription>완료 화면에 표시될 이미지를 설정하세요. (선택)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ImageSelector
              size="large"
              imageUrl={completionImageUrl}
              onImageSelect={imageUpload.selectImage}
              onImageDelete={() => {
                imageUpload.clearImage();
                const currentCompletion = form.getValues("completion");
                if (currentCompletion) {
                  const { imageUrl, imageFileUploadId, ...rest } = currentCompletion;
                  form.setValue("completion", rest, {
                    shouldDirty: true,
                  });
                }
              }}
              disabled={imageUpload.isUploading}
            />
            {imageUpload.isUploading && (
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>링크</CardTitle>
          <CardDescription>완료 화면에 표시될 추가 링크를 설정하세요. (선택)</CardDescription>
        </CardHeader>
        <CardContent>
          <LinksSection form={form} />
        </CardContent>
      </Card>
    </div>
  );
}
