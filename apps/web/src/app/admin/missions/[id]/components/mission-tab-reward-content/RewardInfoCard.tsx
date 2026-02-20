"use client";

import { ImageSelectField } from "@/app/admin/components/common/ImageSelectField";
import { InputField } from "@/app/admin/components/common/InputField";
import { TextareaField } from "@/app/admin/components/common/TextareaField";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { cn } from "@/app/admin/lib/utils";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { rewardBaseSchema } from "@/schemas/reward";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Reward } from "@prisma/client";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

const rewardInfoFormSchema = rewardBaseSchema.pick({
  name: true,
  description: true,
  imageUrl: true,
  imageFileUploadId: true,
});

type RewardInfoFormData = z.infer<typeof rewardInfoFormSchema>;

interface RewardInfoCardProps {
  reward: Reward;
  onUpdate: (data: Partial<RewardInfoFormData>) => void;
  isLoading: boolean;
}

export function RewardInfoCard({ reward, onUpdate, isLoading }: RewardInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<RewardInfoFormData>({
    resolver: zodResolver(rewardInfoFormSchema),
    defaultValues: {
      name: reward.name,
      description: reward.description ?? "",
      imageUrl: reward.imageUrl ?? undefined,
      imageFileUploadId: reward.imageFileUploadId ?? undefined,
    },
  });

  const rewardImage = useSingleImage({
    initialUrl: reward.imageUrl ?? undefined,
    initialFileUploadId: reward.imageFileUploadId ?? undefined,
    bucket: STORAGE_BUCKETS.REWARD_IMAGES,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  useEffect(() => {
    if (isEditing) {
      form.reset({
        name: reward.name,
        description: reward.description ?? "",
        imageUrl: reward.imageUrl ?? undefined,
        imageFileUploadId: reward.imageFileUploadId ?? undefined,
      });
    }
  }, [isEditing, reward.name, reward.description, reward.imageUrl, reward.imageFileUploadId, form]);

  const handleSave = (data: RewardInfoFormData) => {
    onUpdate({
      name: data.name,
      description: data.description || undefined,
      imageUrl: data.imageUrl,
      imageFileUploadId: data.imageFileUploadId,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset({
      name: reward.name,
      description: reward.description ?? "",
      imageUrl: reward.imageUrl ?? undefined,
      imageFileUploadId: reward.imageFileUploadId ?? undefined,
    });
    setIsEditing(false);
  };

  const isFormDisabled = isLoading || rewardImage.isUploading;
  const isSaveDisabled = isFormDisabled || !form.formState.isDirty;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>리워드 정보</CardTitle>
          <CardDescription>리워드 이름, 설명, 이미지를 설정합니다.</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
          className={cn(isEditing && "opacity-0 pointer-events-none")}
        >
          <Pencil className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <InputField
                control={form.control}
                name="name"
                label="리워드 이름"
                description={`${UBQUITOUS_CONSTANTS.MISSION} 완료 시 사용자에게 표시될 리워드 이름입니다.`}
                placeholder="예: 스타벅스 아메리카노"
                disabled={isFormDisabled}
                maxLength={100}
                showCounter
              />
              <TextareaField
                control={form.control}
                name="description"
                label="설명"
                description="리워드에 대한 부가 설명입니다. (선택)"
                placeholder="리워드에 대한 설명을 입력하세요."
                disabled={isFormDisabled}
                isOptional
                maxLength={500}
                showCounter
                rows={2}
              />
              <ImageSelectField
                control={form.control}
                name="imageUrl"
                label="이미지"
                description={
                  rewardImage.isUploading ? "업로드 중..." : "리워드에 표시될 이미지를 선택하세요."
                }
                onImageSelect={rewardImage.upload}
                onImageDelete={() => {
                  rewardImage.discard();
                  form.setValue("imageUrl", undefined, { shouldDirty: true });
                  form.setValue("imageFileUploadId", undefined, { shouldDirty: true });
                }}
                disabled={isFormDisabled}
                isOptional
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isFormDisabled}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSaveDisabled}>
                  {rewardImage.isUploading
                    ? "이미지 업로드 중..."
                    : isLoading
                      ? "저장 중..."
                      : "저장"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex items-start gap-8">
            {reward.imageUrl && (
              <Image
                src={reward.imageUrl}
                alt={reward.name}
                width={100}
                height={100}
                className="rounded-lg object-cover border"
                sizes="100px"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{reward.name}</h3>
              {reward.description && (
                <p className="text-muted-foreground mt-1 text-sm">{reward.description}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
