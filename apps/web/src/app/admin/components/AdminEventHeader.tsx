"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/admin/components/shadcn-ui/alert-dialog";
import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/admin/components/shadcn-ui/tooltip";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { useDeleteEvent } from "@/app/admin/hooks/event";
import { formatDateRange } from "@/app/admin/lib/date-utils";
import { getEventStatus } from "@/app/admin/lib/event-utils";
import type { Event } from "@prisma/client";
import { CalendarDays, CheckCircle, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface AdminEventHeaderProps {
  event: Event & { missions?: { id: string }[] };
  onEdit: () => void;
}

export function AdminEventHeader({ event, onEdit }: AdminEventHeaderProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteEvent = useDeleteEvent({
    onSuccess: () => {
      toast.success("이벤트가 삭제되었습니다");
      setIsDeleteDialogOpen(false);
      router.push(ADMIN_ROUTES.ADMIN);
    },
    onError: error => {
      toast.error(error.message || "이벤트 삭제 중 오류가 발생했습니다");
    },
  });

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = useCallback(() => {
    deleteEvent.mutate(event.id);
  }, [deleteEvent, event.id]);

  const status = getEventStatus(event);
  const missionCount = event.missions?.length ?? 0;

  return (
    <>
      <header className="mb-8 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{event.title}</h1>
              <Badge variant="secondary" className={status.color}>
                {status.label}
              </Badge>
            </div>
            {event.description && (
              <p className="text-muted-foreground mt-2 pr-10">{event.description}</p>
            )}
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                <span>{formatDateRange(event.startDate, event.endDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4" />
                <span>미션 {missionCount}개</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Edit className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>이벤트 편집</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenDeleteDialog}
                  disabled={deleteEvent.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>이벤트 삭제</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이벤트와 관련된 모든 데이터가 삭제됩니다.
              {missionCount > 0 && (
                <>
                  <br />
                  <strong className="text-destructive">
                    현재 이 이벤트에 {missionCount}개의 미션이 연결되어 있습니다.
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEvent.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteEvent.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteEvent.isPending ? "삭제 중..." : "삭제하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
