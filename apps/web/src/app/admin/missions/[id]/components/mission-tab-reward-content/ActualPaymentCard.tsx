"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import type { Reward } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const actualPaymentFormSchema = z.object({
  paidAt: z.date().nullable().optional(),
});

type ActualPaymentFormData = z.infer<typeof actualPaymentFormSchema>;

interface ActualPaymentCardProps {
  reward: Reward;
  onConfirmPayment: (paidAt: Date | null) => void;
  isLoading: boolean;
}

export function ActualPaymentCard({ reward, onConfirmPayment, isLoading }: ActualPaymentCardProps) {
  const form = useForm<ActualPaymentFormData>({
    resolver: zodResolver(actualPaymentFormSchema),
    defaultValues: {
      paidAt: reward.paidAt ? new Date(reward.paidAt) : null,
    },
  });

  useEffect(() => {
    form.reset({
      paidAt: reward.paidAt ? new Date(reward.paidAt) : null,
    });
  }, [reward.paidAt, form]);

  const handleSubmit = (data: ActualPaymentFormData) => {
    onConfirmPayment(data.paidAt ?? null);
  };

  const handleCancel = () => {
    form.reset({
      paidAt: reward.paidAt ? new Date(reward.paidAt) : null,
    });
  };

  const isSaveDisabled = isLoading || !form.formState.isDirty;

  return (
    <Card>
      <CardHeader>
        <CardTitle>실제 지급일</CardTitle>
        <CardDescription>
          리워드를 실제로 지급한 날짜를 기록합니다. 스위치를 끄면 미지급으로 변경됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <DateTimeField
              control={form.control}
              name="paidAt"
              label="지급 여부"
              description="리워드를 실제로 지급한 날짜와 시간을 선택하세요."
              datePlaceholder="날짜 선택"
              disabled={isLoading}
              minuteStep={5}
              isOptional
              supportNull
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                취소
              </Button>
              <Button type="submit" disabled={isSaveDisabled}>
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
