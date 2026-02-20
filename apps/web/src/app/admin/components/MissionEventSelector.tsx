"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import { useAdminEvents } from "@/app/admin/hooks/event";
import { useUpdateMission } from "@/app/admin/hooks/mission";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useState } from "react";
import { toast } from "sonner";
import { EventCreateModal } from "./EventCreateModal";

interface MissionEventSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  missionTitle: string;
  currentEventId: string | null;
}

export function MissionEventSelector({
  open,
  onOpenChange,
  missionId,
  missionTitle,
  currentEventId,
}: MissionEventSelectorProps) {
  const { events } = useAdminEvents({ limit: 100 });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(currentEventId);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success(
        `${UBQUITOUS_CONSTANTS.MISSION}의 ${UBQUITOUS_CONSTANTS.EVENT}이 변경되었습니다`,
      );
      onOpenChange(false);
    },
    onError: error => {
      toast.error(error.message || `${UBQUITOUS_CONSTANTS.MISSION} 수정 중 오류가 발생했습니다`);
    },
  });

  const handleSubmit = () => {
    updateMission.mutate({
      missionId,
      data: {
        eventId: selectedEventId,
      },
    });
  };

  const handleRemoveEvent = () => {
    setSelectedEventId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{UBQUITOUS_CONSTANTS.EVENT} 할당</DialogTitle>
            <DialogDescription>
              {UBQUITOUS_CONSTANTS.MISSION} &quot;{missionTitle}&quot;에 {UBQUITOUS_CONSTANTS.EVENT}
              을 할당하거나 해제합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{UBQUITOUS_CONSTANTS.EVENT} 선택</Label>
              <Select
                value={selectedEventId ?? "none"}
                onValueChange={value => setSelectedEventId(value === "none" ? null : value)}
                disabled={updateMission.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`${UBQUITOUS_CONSTANTS.EVENT}을 선택하세요`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{UBQUITOUS_CONSTANTS.EVENT} 없음</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentEventId && (
              <Button
                variant="outline"
                onClick={handleRemoveEvent}
                disabled={updateMission.isPending}
                className="w-full"
              >
                {UBQUITOUS_CONSTANTS.EVENT} 할당 해제
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setIsCreateEventModalOpen(true);
              }}
              disabled={updateMission.isPending}
              className="w-full"
            >
              새 {UBQUITOUS_CONSTANTS.EVENT} 만들기
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMission.isPending}
            >
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={updateMission.isPending}>
              {updateMission.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EventCreateModal
        open={isCreateEventModalOpen}
        onOpenChange={setIsCreateEventModalOpen}
        onEventCreated={() => {
          setIsCreateEventModalOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
