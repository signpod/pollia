"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { TiptapEditor } from "@/app/admin/components/common/tiptap";
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
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_LINKS_MAX_COUNT,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
} from "@/schemas/mission-completion/missionCompletionSchema";
import type { CompletionLinkInput } from "@/types/dto";
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
  const links: CompletionLinkInput[] = completion?.links || [];
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddLink = () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast.error("링크 이름과 URL을 모두 입력해주세요");
      return;
    }

    try {
      new URL(newUrl);
    } catch {
      toast.error("올바른 URL 형식이 아닙니다");
      return;
    }

    if (links.length >= MISSION_COMPLETION_LINKS_MAX_COUNT) {
      toast.error(`링크는 최대 ${MISSION_COMPLETION_LINKS_MAX_COUNT}개까지 추가할 수 있습니다`);
      return;
    }

    const updatedCompletion: CreateMissionFunnelFormData["completion"] = {
      ...completion,
      links: [...links, { name: newName.trim(), url: newUrl.trim(), order: links.length }],
    };
    form.setValue("completion", updatedCompletion, { shouldDirty: true });
    setNewName("");
    setNewUrl("");
  };

  const handleRemoveLink = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    const updatedCompletion: CreateMissionFunnelFormData["completion"] = {
      ...completion,
      links: next.length > 0 ? next : undefined,
    };
    form.setValue("completion", updatedCompletion, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={`${link.name}-${link.url}`} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-1">{link.name}</div>
                <div className="text-sm text-foreground truncate">{link.url}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLink(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {links.length < MISSION_COMPLETION_LINKS_MAX_COUNT && (
        <div className="flex gap-2">
          <Input
            placeholder="링크 이름"
            value={newName}
            onChange={e => setNewName(e.target.value)}
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
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
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
      )}
    </div>
  );
}

export function CompletionStep({ form }: CompletionStepProps) {
  const imageUpload = useSingleImage({
    onUploadSuccess: (data: UploadedImageData) => {
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
          <CardDescription>
            {UBIQUITOUS_CONSTANTS.MISSION} 완료 시 표시될 화면의 제목과 설명을 입력하세요.
          </CardDescription>
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
              placeholder={`예: ${UBIQUITOUS_CONSTANTS.MISSION}을 완료하셨습니다!`}
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
              showToolbar={true}
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
              imageUrl={completionImageUrl}
              onImageSelect={imageUpload.upload}
              onImageDelete={() => {
                imageUpload.discard();
                const currentCompletion = form.getValues("completion");
                if (currentCompletion) {
                  const { imageUrl, imageFileUploadId, ...rest } = currentCompletion;
                  form.setValue("completion", rest, {
                    shouldDirty: true,
                    shouldValidate: true,
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
