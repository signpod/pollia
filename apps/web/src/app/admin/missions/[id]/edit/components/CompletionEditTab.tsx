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
import { Spinner } from "@/app/admin/components/shadcn-ui/spinner";
import {
  type UseAdminSingleImageReturn,
  useAdminSingleImage,
} from "@/app/admin/hooks/use-admin-image-upload";
import { useReadMissionCompletion } from "@/app/admin/hooks/use-read-mission-completion";
import { useUpdateMissionCompletion } from "@/app/admin/hooks/use-update-mission-completion";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
  type MissionCompletionUpdate,
  missionCompletionUpdateSchema,
} from "@/schemas/mission-completion/missionCompletionSchema";
import type { GetMissionCompletionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";

interface CompletionEditTabProps {
  missionId: string;
}

interface CompletionFormCardProps {
  form: UseFormReturn<MissionCompletionUpdate>;
}

interface LinksCardProps {
  form: UseFormReturn<MissionCompletionUpdate>;
}

interface ImageCardProps {
  form: UseFormReturn<MissionCompletionUpdate>;
  imageUpload: UseAdminSingleImageReturn;
}

interface ActionButtonsProps {
  isPending: boolean;
  isDirty: boolean;
  onReset: () => void;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">완료 화면 정보를 불러오는 중...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-destructive">완료 화면 정보를 불러올 수 없습니다.</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">완료 화면이 설정되지 않았습니다.</p>
          <Button onClick={onCreate}>완료 화면 생성하기</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompletionFormCard({ form }: CompletionFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>완료 화면 정보</CardTitle>
        <CardDescription>미션 완료 시 표시될 화면의 제목과 설명을 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <CharacterCounter
              current={form.watch("title")?.length || 0}
              max={MISSION_COMPLETION_TITLE_MAX_LENGTH}
            />
          </div>
          <Input id="title" {...form.register("title")} placeholder="예: 미션을 완료하셨습니다!" />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">
              설명 <span className="text-destructive">*</span>
            </Label>
            <CharacterCounter
              current={form.watch("description")?.length || 0}
              max={MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}
            />
          </div>
          <TiptapEditor
            content={form.watch("description") || ""}
            onUpdate={content => {
              form.setValue("description", content, { shouldDirty: true });
            }}
            placeholder="완료 화면에 표시될 설명을 입력하세요."
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LinksCard({ form }: LinksCardProps) {
  const links = form.watch("links") || {};
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

    const currentLinks = form.watch("links") || {};
    form.setValue(
      "links",
      { ...currentLinks, [newLinkKey.trim()]: newLinkValue.trim() },
      { shouldDirty: true },
    );
    setNewLinkKey("");
    setNewLinkValue("");
  };

  const handleRemoveLink = (key: string) => {
    const currentLinks = form.watch("links") || {};
    const { [key]: _, ...rest } = currentLinks;
    form.setValue("links", Object.keys(rest).length > 0 ? rest : undefined, {
      shouldDirty: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>링크</CardTitle>
        <CardDescription>완료 화면에 표시될 추가 링크를 설정하세요. (선택)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkEntries.length > 0 && (
          <div className="space-y-2">
            {linkEntries.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground mb-1">{key}</div>
                  <div className="text-sm text-foreground truncate">{value}</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLink(key)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t pt-4">
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
      </CardContent>
    </Card>
  );
}

function ImageCard({ form, imageUpload }: ImageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지</CardTitle>
        <CardDescription>완료 화면에 표시될 이미지를 설정하세요. (선택)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <ImageSelector
            size="large"
            imageUrl={imageUpload.previewUrl || undefined}
            onImageSelect={imageUpload.selectImage}
            onImageDelete={() => {
              imageUpload.clearImage();
              form.setValue("imageUrl", undefined, { shouldDirty: true });
              form.setValue("imageFileUploadId", undefined, { shouldDirty: true });
            }}
            disabled={imageUpload.isUploading}
          />
          {imageUpload.isUploading && <p className="text-sm text-muted-foreground">업로드 중...</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButtons({ isPending, isDirty, onReset }: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onReset} disabled={isPending || !isDirty}>
        <RotateCcw className="size-4" />
        초기화
      </Button>
      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? <Spinner /> : "저장하기"}
      </Button>
    </div>
  );
}

type MissionCompletionData = GetMissionCompletionResponse["data"];

function useCompletionForm(missionCompletion: MissionCompletionData) {
  const links = missionCompletion.links;
  const defaultValues: MissionCompletionUpdate = {
    title: missionCompletion.title,
    description: missionCompletion.description,
    imageUrl: missionCompletion.imageUrl ?? undefined,
    links:
      links && typeof links === "object" && !Array.isArray(links)
        ? (links as Record<string, string>)
        : undefined,
  };

  const form = useForm<MissionCompletionUpdate>({
    resolver: zodResolver(missionCompletionUpdateSchema),
    defaultValues,
  });

  const handleReset = () => form.reset(defaultValues);

  return { form, handleReset };
}

function CompletionForm({
  missionCompletion,
  missionId,
}: {
  missionCompletion: MissionCompletionData;
  missionId: string;
}) {
  const { form, handleReset } = useCompletionForm(missionCompletion);

  const imageUpload = useAdminSingleImage({
    initialUrl: missionCompletion.imageUrl ?? undefined,
    initialFileUploadId: missionCompletion.imageFileUploadId,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const updateMissionCompletion = useUpdateMissionCompletion({
    onSuccess: () => toast.success("완료 화면이 수정되었습니다."),
    onError: err => toast.error(err.message || "완료 화면 수정 중 오류가 발생했습니다."),
  });

  const onSubmit = form.handleSubmit(data => {
    updateMissionCompletion.mutate({ id: missionCompletion.id, data });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <CompletionFormCard form={form} />
      <ImageCard form={form} imageUpload={imageUpload} />
      <LinksCard form={form} />
      <ActionButtons
        isPending={updateMissionCompletion.isPending}
        isDirty={form.formState.isDirty}
        onReset={handleReset}
      />
    </form>
  );
}

export function CompletionEditTab({ missionId }: CompletionEditTabProps) {
  const { data: missionCompletionResponse, isLoading, error } = useReadMissionCompletion(missionId);
  const missionCompletion = missionCompletionResponse?.data;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!missionCompletion) {
    return (
      <EmptyState
        onCreate={() => {
          toast.info("완료 화면 생성 기능은 곧 추가될 예정입니다.");
        }}
      />
    );
  }

  return <CompletionForm missionCompletion={missionCompletion} missionId={missionId} />;
}
