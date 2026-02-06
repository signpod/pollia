"use client";

import { ImageSelectField } from "@/app/admin/components/common/ImageSelectField";
import { DateTimeField } from "@/app/admin/components/common/molecules/DateTimeField";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { rewardInputSchema } from "@/schemas/reward";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentType } from "@prisma/client";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export type RewardFormData = z.infer<typeof rewardInputSchema>;

interface RewardFormProps {
  isLoading: boolean;
  onSubmit: (data: RewardFormData) => void;
  onCancel: () => void;
  initialData?: Partial<RewardFormData>;
}

export function RewardForm({ isLoading, onSubmit, onCancel, initialData }: RewardFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<RewardFormData>({
    resolver: zodResolver(rewardInputSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl,
      imageFileUploadId: initialData?.imageFileUploadId,
      paymentType: initialData?.paymentType ?? PaymentType.IMMEDIATE,
      scheduledDate: initialData?.scheduledDate,
    },
  });

  const paymentType = form.watch("paymentType");

  const rewardImage = useSingleImage({
    initialUrl: initialData?.imageUrl,
    initialFileUploadId: initialData?.imageFileUploadId,
    bucket: STORAGE_BUCKETS.REWARD_IMAGES,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const handleSubmit = (data: RewardFormData) => {
    onSubmit(data);
  };

  const isFormDisabled = isLoading || rewardImage.isUploading;
  const isSaveDisabled = isFormDisabled || (isEditMode && !form.formState.isDirty);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                리워드 이름 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="예: 스타벅스 아메리카노" {...field} disabled={isFormDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                설명 <span className="text-muted-foreground">(선택)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="리워드에 대한 설명을 입력하세요."
                  {...field}
                  disabled={isFormDisabled}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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

        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                지급 유형 <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="지급 유형을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={PaymentType.IMMEDIATE}>즉시 지급</SelectItem>
                  <SelectItem value={PaymentType.SCHEDULED}>예약 지급</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentType === PaymentType.SCHEDULED && (
          <DateTimeField
            control={form.control}
            name="scheduledDate"
            label="예약 일시"
            description="리워드가 지급될 날짜와 시간을 선택하세요."
            datePlaceholder="날짜 선택"
            disabled={isFormDisabled}
            minuteStep={5}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isFormDisabled}>
            취소
          </Button>
          <Button type="submit" disabled={isSaveDisabled}>
            {rewardImage.isUploading ? "이미지 업로드 중..." : isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
