"use client";

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
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import { Spinner } from "@/app/admin/components/shadcn-ui/spinner";
import {
  type UploadedImageData,
  type UseSingleImageReturn,
  useSingleImage,
} from "@/app/admin/hooks/admin-image";
import { useReadMission, useUpdateMission } from "@/app/admin/hooks/mission";
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
import { RotateCcw } from "lucide-react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";

interface BasicInfoEditTabProps {
  missionId: string;
}

interface BasicInfoCardProps {
  form: UseFormReturn<MissionUpdate>;
}

interface ImageCardProps {
  form: UseFormReturn<MissionUpdate>;
  missionImageUpload: UseSingleImageReturn;
  brandLogoUpload: UseSingleImageReturn;
}

interface ActionButtonsProps {
  isPending: boolean;
  isDirty: boolean;
  onReset: () => void;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">미션 정보를 불러오는 중...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-destructive">미션 정보를 불러올 수 없습니다.</p>
    </div>
  );
}

function BasicInfoCard({ form }: BasicInfoCardProps) {
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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="type" className="text-sm font-medium">
                타입
              </Label>
              <p className="text-xs text-muted-foreground">미션의 유형을 선택합니다.</p>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>
            <Select
              value={form.watch("type")}
              onValueChange={value => {
                form.setValue("type", value as MissionType, { shouldDirty: true });
              }}
            >
              <SelectTrigger id="type" className="w-32">
                <SelectValue placeholder="선택" />
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
          </div>

          <NumberField
            control={form.control}
            name="maxParticipants"
            label="최대 참여자 수"
            description="비워두면 제한 없음으로 설정됩니다."
            placeholder="제한 없음"
            isOptional
          />
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
          transformValue={value => (value === undefined ? null : value)}
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

function ImageCard({ form, missionImageUpload, brandLogoUpload }: ImageCardProps) {
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

type MissionData = GetMissionResponse["data"];

function useBasicInfoForm(mission: MissionData) {
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

export function BasicInfoEditTab({ missionId }: BasicInfoEditTabProps) {
  const { data: missionResponse, isLoading, error } = useReadMission(missionId);
  const mission = missionResponse?.data;

  if (isLoading) return <LoadingState />;
  if (error || !mission) return <ErrorState />;

  return <BasicInfoForm mission={mission} missionId={missionId} />;
}

function BasicInfoForm({ mission, missionId }: { mission: MissionData; missionId: string }) {
  const { form, handleReset } = useBasicInfoForm(mission);

  const missionImage = useSingleImage({
    initialUrl: mission.imageUrl ?? undefined,
    initialFileUploadId: mission.imageFileUploadId,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const brandLogo = useSingleImage({
    initialUrl: mission.brandLogoUrl ?? undefined,
    initialFileUploadId: mission.brandLogoFileUploadId,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("brandLogoUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("brandLogoFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const updateMission = useUpdateMission({
    onSuccess: () => toast.success("미션이 수정되었습니다."),
    onError: err => toast.error(err.message || "미션 수정 중 오류가 발생했습니다."),
  });

  const onSubmit = form.handleSubmit(data => {
    updateMission.mutate({ missionId, data });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <BasicInfoCard form={form} />
        <ImageCard form={form} missionImageUpload={missionImage} brandLogoUpload={brandLogo} />
        <ActionButtons
          isPending={updateMission.isPending}
          isDirty={form.formState.isDirty}
          onReset={handleReset}
        />
      </form>
    </Form>
  );
}
