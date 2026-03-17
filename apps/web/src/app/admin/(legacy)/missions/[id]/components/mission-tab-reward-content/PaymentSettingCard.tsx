"use client";

import { SelectField } from "@/app/admin/components/common/SelectField";
import { DateTimeField } from "@/app/admin/components/common/molecules/DateTimeField";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { cn } from "@/app/admin/lib/utils";
import { formatToDateTimeKR } from "@/lib/date";
import { rewardBaseSchema } from "@/schemas/reward";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentType } from "@prisma/client";
import type { Reward } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

const paymentSettingFormSchema = rewardBaseSchema
  .pick({ paymentType: true, scheduledDate: true })
  .refine(
    data => {
      if (data.paymentType === PaymentType.SCHEDULED && !data.scheduledDate) {
        return false;
      }
      return true;
    },
    { message: "예약 지급의 경우 예약 일시는 필수입니다." },
  )
  .refine(
    data => {
      if (data.paymentType === PaymentType.SCHEDULED && data.scheduledDate) {
        return data.scheduledDate > new Date();
      }
      return true;
    },
    { message: "예약 일시는 현재 시간보다 이후여야 합니다." },
  );

type PaymentSettingFormData = z.infer<typeof paymentSettingFormSchema>;

interface PaymentSettingCardProps {
  reward: Reward;
  onUpdate: (data: { paymentType?: PaymentType; scheduledDate?: Date }) => void;
  isLoading: boolean;
}

export function PaymentSettingCard({ reward, onUpdate, isLoading }: PaymentSettingCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<PaymentSettingFormData>({
    resolver: zodResolver(paymentSettingFormSchema),
    defaultValues: {
      paymentType: reward.paymentType,
      scheduledDate: reward.scheduledDate ?? undefined,
    },
  });

  const paymentType = form.watch("paymentType");

  useEffect(() => {
    if (isEditing) {
      form.reset({
        paymentType: reward.paymentType,
        scheduledDate: reward.scheduledDate ?? undefined,
      });
    }
  }, [isEditing, reward.paymentType, reward.scheduledDate, form]);

  const handleSave = (data: PaymentSettingFormData) => {
    onUpdate({
      paymentType: data.paymentType,
      scheduledDate: data.paymentType === PaymentType.SCHEDULED ? data.scheduledDate : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset({
      paymentType: reward.paymentType,
      scheduledDate: reward.scheduledDate ?? undefined,
    });
    setIsEditing(false);
  };

  const isFormDisabled = isLoading;
  const isSaveDisabled = isFormDisabled || !form.formState.isDirty;
  const paymentTypeLabel = reward.paymentType === PaymentType.IMMEDIATE ? "즉시 지급" : "예약 지급";

  const paymentTypeOptions = [
    { value: PaymentType.IMMEDIATE, label: "즉시 지급" },
    { value: PaymentType.SCHEDULED, label: "예약 지급" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>지급일 설정</CardTitle>
          <CardDescription>
            즉시 지급 또는 예약 지급을 선택하고, 예약 시 일시를 설정합니다.
          </CardDescription>
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
              <SelectField
                control={form.control}
                name="paymentType"
                label="지급 유형"
                description="리워드를 즉시 지급할지, 예약 일시에 지급할지 선택합니다."
                placeholder="지급 유형을 선택하세요"
                options={paymentTypeOptions}
                disabled={isFormDisabled}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isFormDisabled}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSaveDisabled}>
                  {isLoading ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {paymentTypeLabel}
            </span>
            {reward.scheduledDate && (
              <span className="text-sm text-muted-foreground">
                {formatToDateTimeKR(reward.scheduledDate)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
