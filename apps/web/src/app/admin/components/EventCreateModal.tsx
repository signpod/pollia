"use client";

import { DatePicker } from "@/app/admin/components/common/atom/DatePicker";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/admin/components/shadcn-ui/form";
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { useCreateEvent } from "@/app/admin/hooks/event";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { type EventInput, eventInputSchema } from "@/schemas/event";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EventCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export function EventCreateModal({ open, onOpenChange, onEventCreated }: EventCreateModalProps) {
  const form = useForm<EventInput>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const createEvent = useCreateEvent({
    onSuccess: () => {
      toast.success(`${UBQUITOUS_CONSTANTS.EVENT}이 생성되었습니다`);
      form.reset();
      onOpenChange(false);
      onEventCreated?.();
    },
    onError: error => {
      toast.error(error.message || `${UBQUITOUS_CONSTANTS.EVENT} 생성 중 오류가 발생했습니다`);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit((data: EventInput) => {
    createEvent.mutate(data);
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 {UBQUITOUS_CONSTANTS.EVENT} 만들기</DialogTitle>
          <DialogDescription>
            {UBQUITOUS_CONSTANTS.EVENT} 정보를 입력하고 {UBQUITOUS_CONSTANTS.MISSION}을
            그룹화하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {UBQUITOUS_CONSTANTS.EVENT} 제목 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`예: 신년 ${UBQUITOUS_CONSTANTS.EVENT}`}
                      disabled={createEvent.isPending}
                    />
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
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`${UBQUITOUS_CONSTANTS.EVENT}에 대한 간단한 설명을 입력하세요`}
                      rows={3}
                      disabled={createEvent.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={createEvent.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료일</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={createEvent.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createEvent.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? "생성 중..." : "생성하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
