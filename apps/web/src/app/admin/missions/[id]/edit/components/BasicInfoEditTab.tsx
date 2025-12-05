"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
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
import { ADMIN_STORAGE_BUCKETS } from "@/app/admin/constants/storage";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useUpdateMission } from "@/app/admin/hooks/use-update-mission";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { type MissionUpdate, missionUpdateSchema } from "@/schemas/mission";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface BasicInfoEditTabProps {
  missionId: string;
}

interface BasicInfoCardProps {
  form: UseFormReturn<MissionUpdate>;
}

interface ImageCardProps {
  form: UseFormReturn<MissionUpdate>;
  missionImageUrl: string | undefined;
  brandLogoUrl: string | undefined;
  missionImageUpload: ReturnType<typeof useImageUpload>;
  brandLogoUpload: ReturnType<typeof useImageUpload>;
  onMissionImageSelect: (file: File) => void;
  onMissionImageDelete: () => void;
  onBrandLogoSelect: (file: File) => void;
  onBrandLogoDelete: () => void;
}

interface ActionButtonsProps {
  isPending: boolean;
  isDirty: boolean;
  onReset: () => void;
}

// ============================================================================
// Sub Components
// ============================================================================

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
          <Label htmlFor="title">
            제목 <span className="text-destructive">*</span>
          </Label>
          <Input id="title" placeholder="미션 제목을 입력하세요" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
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
          <Label htmlFor="target">대상</Label>
          <Input id="target" placeholder="미션 대상을 입력하세요" {...form.register("target")} />
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
              valueAsNumber: true,
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

function ImageCard({
  missionImageUrl,
  brandLogoUrl,
  missionImageUpload,
  brandLogoUpload,
  onMissionImageSelect,
  onMissionImageDelete,
  onBrandLogoSelect,
  onBrandLogoDelete,
}: ImageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지</CardTitle>
        <CardDescription>미션 이미지와 브랜드 로고를 수정하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>미션 이미지</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={missionImageUrl}
              onImageSelect={onMissionImageSelect}
              onImageDelete={onMissionImageDelete}
              disabled={missionImageUpload.isUploading || missionImageUpload.isDeleting}
            />
            {(missionImageUpload.isUploading || missionImageUpload.isDeleting) && (
              <p className="text-sm text-muted-foreground">
                {missionImageUpload.isUploading ? "업로드 중..." : "삭제 중..."}
              </p>
            )}
            {missionImageUpload.uploadError && (
              <p className="text-sm text-destructive">
                업로드 실패: {missionImageUpload.uploadError.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>브랜드 로고</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={brandLogoUrl}
              onImageSelect={onBrandLogoSelect}
              onImageDelete={onBrandLogoDelete}
              disabled={brandLogoUpload.isUploading || brandLogoUpload.isDeleting}
            />
            {(brandLogoUpload.isUploading || brandLogoUpload.isDeleting) && (
              <p className="text-sm text-muted-foreground">
                {brandLogoUpload.isUploading ? "업로드 중..." : "삭제 중..."}
              </p>
            )}
            {brandLogoUpload.uploadError && (
              <p className="text-sm text-destructive">
                업로드 실패: {brandLogoUpload.uploadError.message}
              </p>
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

// ============================================================================
// Hooks
// ============================================================================

type MissionData = GetMissionResponse["data"];

function useBasicInfoForm(mission: MissionData | undefined) {
  const form = useForm<MissionUpdate>({
    resolver: zodResolver(missionUpdateSchema),
    defaultValues: {
      title: "",
      description: "",
      target: "",
      imageUrl: undefined,
      brandLogoUrl: undefined,
      estimatedMinutes: undefined,
      deadline: undefined,
      isActive: undefined,
    },
  });

  useEffect(() => {
    if (mission) {
      form.reset({
        title: mission.title,
        description: mission.description ?? "",
        target: mission.target ?? "",
        imageUrl: mission.imageUrl ?? undefined,
        brandLogoUrl: mission.brandLogoUrl ?? undefined,
        estimatedMinutes: mission.estimatedMinutes ?? undefined,
        deadline: mission.deadline ? new Date(mission.deadline) : undefined,
        isActive: mission.isActive,
      });
    }
  }, [mission, form]);

  const handleReset = () => {
    if (mission) {
      form.reset({
        title: mission.title,
        description: mission.description ?? "",
        target: mission.target ?? "",
        imageUrl: mission.imageUrl ?? undefined,
        brandLogoUrl: mission.brandLogoUrl ?? undefined,
        estimatedMinutes: mission.estimatedMinutes ?? undefined,
        deadline: mission.deadline ? new Date(mission.deadline) : undefined,
        isActive: mission.isActive,
      });
    }
  };

  return { form, handleReset };
}

function useMissionImageUpload(form: UseFormReturn<MissionUpdate>) {
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<{ path: string; fileUploadId: string } | null>(null);

  const upload = useImageUpload({
    bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: result => {
      form.setValue("imageUrl", result.publicUrl, { shouldDirty: true });
      setFile({ path: result.path, fileUploadId: result.fileUploadId });
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview("");
      }
    },
    onError: error => {
      console.error("Mission image upload failed:", error);
      toast.error("미션 이미지 업로드 실패", { description: error.message });
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview("");
      }
    },
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSelect = (selectedFile: File) => {
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    upload.upload(selectedFile);
  };

  const handleDelete = () => {
    if (file) {
      upload.deleteImage({ path: file.path, bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES });
    }
    setFile(null);
    form.setValue("imageUrl", undefined, { shouldDirty: true });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview("");
    }
  };

  const imageUrl = form.watch("imageUrl") || preview;

  return { upload, imageUrl, handleSelect, handleDelete };
}

function useBrandLogoUpload(form: UseFormReturn<MissionUpdate>) {
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<{ path: string; fileUploadId: string } | null>(null);

  const upload = useImageUpload({
    bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: result => {
      form.setValue("brandLogoUrl", result.publicUrl, { shouldDirty: true });
      setFile({ path: result.path, fileUploadId: result.fileUploadId });
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview("");
      }
    },
    onError: error => {
      console.error("Brand logo upload failed:", error);
      toast.error("브랜드 로고 업로드 실패", { description: error.message });
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview("");
      }
    },
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSelect = (selectedFile: File) => {
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    upload.upload(selectedFile);
  };

  const handleDelete = () => {
    if (file) {
      upload.deleteImage({ path: file.path, bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES });
    }
    setFile(null);
    form.setValue("brandLogoUrl", undefined, { shouldDirty: true });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview("");
    }
  };

  const imageUrl = form.watch("brandLogoUrl") || preview;

  return { upload, imageUrl, handleSelect, handleDelete };
}

// ============================================================================
// Main Component
// ============================================================================

export function BasicInfoEditTab({ missionId }: BasicInfoEditTabProps) {
  const { data: missionResponse, isLoading, error } = useReadMission(missionId);
  const mission = missionResponse?.data;

  const { form, handleReset } = useBasicInfoForm(mission);

  const missionImage = useMissionImageUpload(form);
  const brandLogo = useBrandLogoUpload(form);

  const updateMission = useUpdateMission({
    onSuccess: () => toast.success("미션이 수정되었습니다."),
    onError: err => toast.error(err.message || "미션 수정 중 오류가 발생했습니다."),
  });

  const onSubmit = form.handleSubmit(data => {
    updateMission.mutate({ missionId, data });
  });

  if (isLoading) return <LoadingState />;
  if (error || !mission) return <ErrorState />;

  console.log(form.formState);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <BasicInfoCard form={form} />

      <ImageCard
        form={form}
        missionImageUrl={missionImage.imageUrl}
        brandLogoUrl={brandLogo.imageUrl}
        missionImageUpload={missionImage.upload}
        brandLogoUpload={brandLogo.upload}
        onMissionImageSelect={missionImage.handleSelect}
        onMissionImageDelete={missionImage.handleDelete}
        onBrandLogoSelect={brandLogo.handleSelect}
        onBrandLogoDelete={brandLogo.handleDelete}
      />

      <ActionButtons
        isPending={updateMission.isPending}
        isDirty={form.formState.isDirty}
        onReset={handleReset}
      />
    </form>
  );
}
