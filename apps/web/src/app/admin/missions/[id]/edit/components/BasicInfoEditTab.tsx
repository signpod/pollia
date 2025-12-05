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
import { ADMIN_STORAGE_BUCKETS } from "@/app/admin/constants/storage";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useUpdateMission } from "@/app/admin/hooks/use-update-mission";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { type MissionUpdate, missionUpdateSchema } from "@/schemas/mission";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface BasicInfoEditTabProps {
  missionId: string;
}

export function BasicInfoEditTab({ missionId }: BasicInfoEditTabProps) {
  const { data: missionResponse, isLoading, error } = useReadMission(missionId);
  const mission = missionResponse?.data;

  const [missionImagePreview, setMissionImagePreview] = useState<string>("");
  const [brandLogoPreview, setBrandLogoPreview] = useState<string>("");

  const [missionImageFile, setMissionImageFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const [brandLogoFile, setBrandLogoFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

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

  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success("미션이 수정되었습니다.");
    },
    onError: error => {
      toast.error(error.message || "미션 수정 중 오류가 발생했습니다.");
    },
  });

  const missionImageUpload = useImageUpload({
    bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: result => {
      form.setValue("imageUrl", result.publicUrl, { shouldDirty: true });
      setMissionImageFile({
        path: result.path,
        fileUploadId: result.fileUploadId,
      });

      if (missionImagePreview) {
        URL.revokeObjectURL(missionImagePreview);
        setMissionImagePreview("");
      }
    },
    onError: error => {
      console.error("Mission image upload failed:", error);
      toast.error("미션 이미지 업로드 실패", {
        description: error.message,
      });
      if (missionImagePreview) {
        URL.revokeObjectURL(missionImagePreview);
        setMissionImagePreview("");
      }
    },
  });

  const brandLogoUpload = useImageUpload({
    bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: result => {
      form.setValue("brandLogoUrl", result.publicUrl, { shouldDirty: true });
      setBrandLogoFile({
        path: result.path,
        fileUploadId: result.fileUploadId,
      });

      if (brandLogoPreview) {
        URL.revokeObjectURL(brandLogoPreview);
        setBrandLogoPreview("");
      }
    },
    onError: error => {
      console.error("Brand logo upload failed:", error);
      toast.error("브랜드 로고 업로드 실패", {
        description: error.message,
      });
      if (brandLogoPreview) {
        URL.revokeObjectURL(brandLogoPreview);
        setBrandLogoPreview("");
      }
    },
  });

  useEffect(() => {
    return () => {
      if (missionImagePreview) {
        URL.revokeObjectURL(missionImagePreview);
      }
      if (brandLogoPreview) {
        URL.revokeObjectURL(brandLogoPreview);
      }
    };
  }, [missionImagePreview, brandLogoPreview]);

  const handleMissionImageSelect = (file: File) => {
    if (missionImagePreview) {
      URL.revokeObjectURL(missionImagePreview);
    }

    const url = URL.createObjectURL(file);
    setMissionImagePreview(url);
    missionImageUpload.upload(file);
  };

  const handleMissionImageDelete = () => {
    if (missionImageFile) {
      missionImageUpload.deleteImage({
        path: missionImageFile.path,
        bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
      });
    }

    setMissionImageFile(null);
    form.setValue("imageUrl", undefined, { shouldDirty: true });

    if (missionImagePreview) {
      URL.revokeObjectURL(missionImagePreview);
      setMissionImagePreview("");
    }
  };

  const handleBrandLogoSelect = (file: File) => {
    if (brandLogoPreview) {
      URL.revokeObjectURL(brandLogoPreview);
    }

    const url = URL.createObjectURL(file);
    setBrandLogoPreview(url);
    brandLogoUpload.upload(file);
  };

  const handleBrandLogoDelete = () => {
    if (brandLogoFile) {
      brandLogoUpload.deleteImage({
        path: brandLogoFile.path,
        bucket: ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
      });
    }

    setBrandLogoFile(null);
    form.setValue("brandLogoUrl", undefined, { shouldDirty: true });

    if (brandLogoPreview) {
      URL.revokeObjectURL(brandLogoPreview);
      setBrandLogoPreview("");
    }
  };

  const onSubmit = form.handleSubmit(data => {
    updateMission.mutate({
      missionId,
      data,
    });
  });

  const missionImageUrl = form.watch("imageUrl") || missionImagePreview;
  const brandLogoUrl = form.watch("brandLogoUrl") || brandLogoPreview;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">미션 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">미션 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
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
                onImageSelect={handleMissionImageSelect}
                onImageDelete={handleMissionImageDelete}
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
                onImageSelect={handleBrandLogoSelect}
                onImageDelete={handleBrandLogoDelete}
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

      <div className="flex justify-end">
        <Button type="submit" disabled={updateMission.isPending || !form.formState.isDirty}>
          {updateMission.isPending ? "수정 중..." : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
