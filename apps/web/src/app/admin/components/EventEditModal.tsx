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
import { useUpdateEvent } from "@/app/admin/hooks/event";
import { type EventUpdate, eventUpdateSchema } from "@/schemas/event";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Event } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EventEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export function EventEditModal({ open, onOpenChange, event }: EventEditModalProps) {
  const form = useForm<EventUpdate>({
    resolver: zodResolver(eventUpdateSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? "",
      startDate: event.startDate ? new Date(event.startDate) : undefined,
      endDate: event.endDate ? new Date(event.endDate) : undefined,
    },
  });

  const updateEvent = useUpdateEvent({
    onSuccess: () => {
      toast.success("이벤트가 수정되었습니다");
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.message || "이벤트 수정 중 오류가 발생했습니다");
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: event.title,
        description: event.description ?? "",
        startDate: event.startDate ? new Date(event.startDate) : undefined,
        endDate: event.endDate ? new Date(event.endDate) : undefined,
      });
    }
  }, [open, event, form]);

  const handleSubmit = form.handleSubmit((data: EventUpdate) => {
    updateEvent.mutate({
      eventId: event.id,
      data,
    });
  });

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>이벤트 편집</DialogTitle>
          <DialogDescription>이벤트 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    이벤트 제목 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="예: 신년 이벤트"
                      disabled={updateEvent.isPending}
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
                      placeholder="이벤트에 대한 간단한 설명을 입력하세요"
                      rows={3}
                      disabled={updateEvent.isPending}
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
                        disabled={updateEvent.isPending}
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
                        disabled={updateEvent.isPending}
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
                disabled={updateEvent.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateEvent.isPending}>
                {updateEvent.isPending ? "수정 중..." : "수정하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
