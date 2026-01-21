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
import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Textarea } from "@/app/admin/components/shadcn-ui/textarea";
import { useUpdateEvent } from "@/app/admin/hooks/event";
import type { Event } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export function EventEditModal({ open, onOpenChange, event }: EventEditModalProps) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    event.startDate ? new Date(event.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    event.endDate ? new Date(event.endDate) : undefined,
  );

  const updateEvent = useUpdateEvent({
    onSuccess: () => {
      toast.success("이벤트가 수정되었습니다.");
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.message || "이벤트 수정 중 오류가 발생했습니다.");
    },
  });

  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setStartDate(event.startDate ? new Date(event.startDate) : undefined);
      setEndDate(event.endDate ? new Date(event.endDate) : undefined);
    }
  }, [open, event]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("이벤트 제목을 입력해주세요.");
      return;
    }

    updateEvent.mutate({
      eventId: event.id,
      data: {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
      },
    });
  };

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

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">이벤트 제목 *</Label>
            <Input
              id="event-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: 신년 이벤트"
              disabled={updateEvent.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">설명</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="이벤트에 대한 간단한 설명을 입력하세요"
              rows={3}
              disabled={updateEvent.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시작일</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                disabled={updateEvent.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>종료일</Label>
              <DatePicker value={endDate} onChange={setEndDate} disabled={updateEvent.isPending} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={updateEvent.isPending}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={updateEvent.isPending}>
            {updateEvent.isPending ? "수정 중..." : "수정하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
