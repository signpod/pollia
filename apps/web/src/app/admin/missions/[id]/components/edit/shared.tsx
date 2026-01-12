import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { NumberField } from "@/app/admin/components/common/NumberField";
import { TiptapEditor } from "@/app/admin/components/common/TiptapEditor";
import { DateTimeField } from "@/app/admin/components/common/molecule/DateTimeField";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import type { UseSingleImageReturn } from "@/app/admin/hooks/admin-image";
import { MISSION_TYPE_LABELS } from "@/constants/action";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  type MissionUpdate,
  missionUpdateSchema,
} from "@/schemas/mission";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
  type MissionCompletionForm,
  missionCompletionFormSchema,
} from "@/schemas/mission-completion";
import type { GetMissionCompletionResponse, GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";

export type MissionData = GetMissionResponse["data"];
export type MissionCompletionData = GetMissionCompletionResponse["data"];

export interface BasicInfoCardProps {
  form: UseFormReturn<MissionUpdate>;
}

export interface ImageCardProps {
  form: UseFormReturn<MissionUpdate>;
  missionImageUpload: UseSingleImageReturn;
  brandLogoUpload: UseSingleImageReturn;
}

export interface CompletionCardProps {
  form: UseFormReturn<MissionCompletionForm>;
  completionImageUpload: UseSingleImageReturn;
}

export function BasicInfoCard({ form }: BasicInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>미션의 제목과 설명을 수정하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <CharacterCounter
              current={form.watch("title")?.length || 0}
              max={MISSION_TITLE_MAX_LENGTH}
            />
          </div>
          <Input
            id="title"
            placeholder="미션 제목을 입력하세요"
            maxLength={MISSION_TITLE_MAX_LENGTH}
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="flex gap-10">
          <div className="space-y-2">
            <Label htmlFor="type">타입</Label>
            <Select
              value={form.watch("type")}
              onValueChange={value => {
                form.setValue("type", value as MissionType, { shouldDirty: true });
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="미션 타입을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MissionType.GENERAL}>
                  {MISSION_TYPE_LABELS[MissionType.GENERAL]}
                </SelectItem>
                <SelectItem value={MissionType.EXPERIENCE_GROUP}>
                  {MISSION_TYPE_LABELS[MissionType.EXPERIENCE_GROUP]}
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">최대 참여자 수</Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="제한 없음"
              min="1"
              {...form.register("maxParticipants", {
                setValueAs: value => {
                  if (!value || value === "") return null;
                  const num = Number(value);
                  return Number.isNaN(num) ? null : num;
                },
              })}
            />
            {form.formState.errors.maxParticipants && (
              <p className="text-sm text-destructive">
                {form.formState.errors.maxParticipants.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">설명</Label>
            <CharacterCounter
              current={form.watch("description")?.length || 0}
              max={MISSION_DESCRIPTION_MAX_LENGTH}
            />
          </div>
          <TiptapEditor
            content={form.watch("description") || ""}
            onUpdate={content => {
              form.setValue("description", content || undefined, { shouldDirty: true });
            }}
            placeholder="미션에 대한 설명을 입력하세요"
            showToolbar={true}
            className="min-h-[200px]"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="target">대상</Label>
            <CharacterCounter
              current={form.watch("target")?.length || 0}
              max={MISSION_TARGET_MAX_LENGTH}
            />
          </div>
          <Input
            id="target"
            placeholder="미션 대상을 입력하세요"
            maxLength={MISSION_TARGET_MAX_LENGTH}
            {...form.register("target")}
          />
          {form.formState.errors.target && (
            <p className="text-sm text-destructive">{form.formState.errors.target.message}</p>
          )}
        </div>

        <NumberField
          control={form.control}
          name="estimatedMinutes"
          label="예상 소요 시간 (분)"
          description="미션 완료에 필요한 예상 시간을 입력합니다."
          isOptional
        />

        <DateTimeField
          control={form.control}
          name="deadline"
          label="마감일"
          description="미션의 마감일을 설정합니다."
          datePlaceholder="마감일 선택"
          isOptional
        />
      </CardContent>
    </Card>
  );
}

export function ImageCard({ form, missionImageUpload, brandLogoUpload }: ImageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지</CardTitle>
        <CardDescription>미션 이미지와 브랜드 로고를 수정하세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-10">
        <div className="space-y-2">
          <Label>미션 이미지</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={missionImageUpload.previewUrl || undefined}
              onImageSelect={missionImageUpload.upload}
              onImageDelete={() => {
                missionImageUpload.discard();
                form.setValue("imageUrl", null, { shouldDirty: true });
                form.setValue("imageFileUploadId", null, { shouldDirty: true });
              }}
              disabled={missionImageUpload.isUploading}
            />
            {missionImageUpload.isUploading && (
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>브랜드 로고</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={brandLogoUpload.previewUrl || undefined}
              onImageSelect={brandLogoUpload.upload}
              onImageDelete={() => {
                brandLogoUpload.discard();
                form.setValue("brandLogoUrl", null, { shouldDirty: true });
                form.setValue("brandLogoFileUploadId", null, { shouldDirty: true });
              }}
              disabled={brandLogoUpload.isUploading}
            />
            {brandLogoUpload.isUploading && (
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function useBasicInfoForm(mission: MissionData) {
  const defaultValues = {
    title: mission.title,
    type: mission.type,
    description: mission.description ?? "",
    target: mission.target ?? "",
    imageUrl: mission.imageUrl ?? undefined,
    brandLogoUrl: mission.brandLogoUrl ?? undefined,
    estimatedMinutes: mission.estimatedMinutes ?? undefined,
    deadline: mission.deadline ? new Date(mission.deadline) : undefined,
    maxParticipants: mission.maxParticipants ?? null,
    isActive: mission.isActive,
  };

  const form = useForm<MissionUpdate>({
    resolver: zodResolver(missionUpdateSchema),
    defaultValues,
  });

  const handleReset = () => form.reset(defaultValues);

  return { form, handleReset };
}

function LinksSection({ form }: { form: UseFormReturn<MissionCompletionForm> }) {
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
      {
        shouldDirty: true,
      },
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
        <Button type="button" onClick={handleAddLink} aria-label="링크 추가">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function CompletionCard({ form, completionImageUpload }: CompletionCardProps) {
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
                current={form.watch("title")?.length || 0}
                max={MISSION_COMPLETION_TITLE_MAX_LENGTH}
              />
            </div>
            <Input
              id="completion-title"
              placeholder="예: 미션을 완료하셨습니다!"
              maxLength={MISSION_COMPLETION_TITLE_MAX_LENGTH}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="completion-description">
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
                form.setValue("description", content || "", { shouldDirty: true });
              }}
              placeholder="완료 화면에 표시될 설명을 입력하세요."
              showToolbar={true}
              className="min-h-[200px]"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
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
              imageUrl={completionImageUpload.previewUrl || undefined}
              onImageSelect={completionImageUpload.upload}
              onImageDelete={() => {
                completionImageUpload.discard();
                form.setValue("imageUrl", undefined, { shouldDirty: true });
                form.setValue("imageFileUploadId", undefined, { shouldDirty: true });
              }}
              disabled={completionImageUpload.isUploading}
            />
            {completionImageUpload.isUploading && (
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

export function useCompletionForm(completion: MissionCompletionData | null) {
  const defaultValues: MissionCompletionForm = {
    title: completion?.title ?? "",
    description: completion?.description ?? "",
    imageUrl: completion?.imageUrl ?? undefined,
    imageFileUploadId: completion?.imageFileUploadId ?? undefined,
    links: completion?.links ?? undefined,
  };

  const form = useForm<MissionCompletionForm>({
    resolver: zodResolver(missionCompletionFormSchema),
    defaultValues,
  });

  const handleReset = () => form.reset(defaultValues);

  return { form, handleReset };
}
