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
import { useCreateEvent } from "@/app/admin/hooks/event";
import { useState } from "react";
import { toast } from "sonner";

interface EventCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventCreateModal({ open, onOpenChange }: EventCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const createEvent = useCreateEvent({
    onSuccess: () => {
      toast.success("이벤트가 생성되었습니다.");
      resetForm();
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.message || "이벤트 생성 중 오류가 발생했습니다.");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("이벤트 제목을 입력해주세요.");
      return;
    }

    createEvent.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate,
    });
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 이벤트 만들기</DialogTitle>
          <DialogDescription>이벤트 정보를 입력하고 미션을 그룹화하세요.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">이벤트 제목 *</Label>
            <Input
              id="event-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: 2024 신년 이벤트"
              disabled={createEvent.isPending}
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
              disabled={createEvent.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시작일</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                disabled={createEvent.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>종료일</Label>
              <DatePicker value={endDate} onChange={setEndDate} disabled={createEvent.isPending} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={createEvent.isPending}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={createEvent.isPending}>
            {createEvent.isPending ? "생성 중..." : "생성하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
