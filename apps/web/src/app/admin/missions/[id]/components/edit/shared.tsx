import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import { CharacterCounter } from "@/app/admin/components/common/InputField";
import { TiptapEditor } from "@/app/admin/components/common/TiptapEditor";
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
import type { UseAdminSingleImageReturn } from "@/app/admin/hooks/use-admin-image-upload";
import { MISSION_TYPE_LABELS } from "@/constants/action";
import {
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TARGET_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  type MissionUpdate,
  missionUpdateSchema,
} from "@/schemas/mission";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType } from "@prisma/client";
import { type UseFormReturn, useForm } from "react-hook-form";

export type MissionData = GetMissionResponse["data"];

export interface BasicInfoCardProps {
  form: UseFormReturn<MissionUpdate>;
}

export interface ImageCardProps {
  form: UseFormReturn<MissionUpdate>;
  missionImageUpload: UseAdminSingleImageReturn;
  brandLogoUpload: UseAdminSingleImageReturn;
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
                setValueAs: value => (value === "" ? null : Number(value)),
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

        <div className="space-y-2">
          <Label htmlFor="estimatedMinutes">예상 소요 시간 (분)</Label>
          <Input
            id="estimatedMinutes"
            type="number"
            placeholder="예상 소요 시간을 입력하세요"
            {...form.register("estimatedMinutes", {
              setValueAs: value => (value === "" ? undefined : Number(value)),
            })}
          />
          {form.formState.errors.estimatedMinutes && (
            <p className="text-sm text-destructive">
              {form.formState.errors.estimatedMinutes.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">마감일</Label>
          <Input
            id="deadline"
            type="datetime-local"
            value={(() => {
              const deadline = form.watch("deadline");
              return deadline ? new Date(deadline).toISOString().slice(0, 16) : "";
            })()}
            onChange={e => {
              const value = e.target.value;
              form.setValue("deadline", value ? new Date(value) : undefined, {
                shouldDirty: true,
              });
            }}
          />
          {form.formState.errors.deadline && (
            <p className="text-sm text-destructive">{form.formState.errors.deadline.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImageCard({
  form,
  missionImageUpload,
  brandLogoUpload,
}: ImageCardProps) {
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
              onImageSelect={missionImageUpload.selectImage}
              onImageDelete={() => {
                missionImageUpload.clearImage();
                form.setValue("imageUrl", undefined, { shouldDirty: true });
                form.setValue("imageFileUploadId", undefined, { shouldDirty: true });
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
              onImageSelect={brandLogoUpload.selectImage}
              onImageDelete={() => {
                brandLogoUpload.clearImage();
                form.setValue("brandLogoUrl", undefined, { shouldDirty: true });
                form.setValue("brandLogoFileUploadId", undefined, { shouldDirty: true });
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
