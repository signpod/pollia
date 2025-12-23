"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
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
import { Label } from "@/app/admin/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { useFormImageUpload } from "@/app/admin/hooks/use-form-image-upload";
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

  const rewardImage = useFormImageUpload({
    form,
    urlField: "imageUrl",
    fileUploadIdField: "imageFileUploadId",
    bucket: STORAGE_BUCKETS.REWARD_IMAGES,
    errorMessage: "리워드 이미지 업로드 실패",
  });

  const handleSubmit = (data: RewardFormData) => {
    onSubmit(data);
  };

  const isFormDisabled = isLoading || rewardImage.upload.isUploading;
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            이미지 <span className="text-muted-foreground">(선택)</span>
          </Label>
          <div className="flex items-center gap-3">
            <ImageSelector
              size="large"
              imageUrl={rewardImage.imageUrl || undefined}
              onImageSelect={rewardImage.handleSelect}
              onImageDelete={rewardImage.handleDelete}
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">리워드에 표시될 이미지를 선택하세요.</p>
          </div>
        </div>

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
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  예약 일시 <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                    onChange={e => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                    }}
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isFormDisabled}>
            취소
          </Button>
          <Button type="submit" disabled={isSaveDisabled}>
            {rewardImage.upload.isUploading
              ? "이미지 업로드 중..."
              : isLoading
                ? "저장 중..."
                : "저장"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
