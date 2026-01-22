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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/admin/components/shadcn-ui/tooltip";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { useDeleteMission, useDuplicateMission } from "@/app/admin/hooks/mission";
import { Check, Copy, CopyPlus, ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";
import { MissionActiveToggle } from "./MissionActiveToggle";

interface AdminMissionHeaderProps {
  title: string;
  description?: string;
  nav?: ReactNode;
  missionId: string;
  isActive: boolean;
}

export function AdminMissionHeader({
  title,
  description,
  nav,
  missionId,
  isActive,
}: AdminMissionHeaderProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const duplicateMission = useDuplicateMission({
    onSuccess: data => {
      toast.success("미션이 복제되었습니다");
      setIsDuplicateDialogOpen(false);
      router.push(ADMIN_ROUTES.ADMIN_MISSION_EDIT(data.data.id));
    },
    onError: error => {
      toast.error(error.message || "미션 복제 중 오류가 발생했습니다");
    },
  });

  const deleteMission = useDeleteMission({
    onSuccess: () => {
      toast.success("미션이 삭제되었습니다");
      setIsDeleteDialogOpen(false);
      router.push(ADMIN_ROUTES.ADMIN);
    },
    onError: error => {
      toast.error(error.message || "미션 삭제 중 오류가 발생했습니다");
    },
  });

  const getMissionUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    return `${baseUrl}/mission/${missionId}`;
  }, [missionId]);

  const handleCopyLink = useCallback(async () => {
    const url = getMissionUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("링크가 복사되었습니다");
    setTimeout(() => setCopied(false), 2000);
  }, [getMissionUrl]);

  const handleOpenMission = useCallback(() => {
    const url = getMissionUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }, [getMissionUrl]);

  const handleConfirmDuplicate = useCallback(() => {
    duplicateMission.mutate({ missionId });
  }, [duplicateMission, missionId]);

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteConfirmText("");
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmText !== "삭제") return;
    deleteMission.mutate(missionId);
  }, [deleteMission, missionId, deleteConfirmText]);

  const isDeleteButtonEnabled = deleteConfirmText === "삭제";

  return (
    <>
      <header className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground mt-2 pr-10">{description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDuplicateDialogOpen(true)}
                  disabled={duplicateMission.isPending}
                >
                  <CopyPlus className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>미션 복제</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 text-foreground" />
                  ) : (
                    <Copy className="h-4 w-4 text-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "복사됨" : "링크 복사"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleOpenMission}>
                  <ExternalLink className="h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>미션 페이지 열기</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenDeleteDialog}
                  disabled={deleteMission.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>미션 삭제</TooltipContent>
            </Tooltip>

            <MissionActiveToggle missionId={missionId} isActive={isActive} />
          </div>
        </div>
        {nav && <div>{nav}</div>}
      </header>

      <AlertDialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>미션을 복제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              미션의 모든 액션과 옵션이 함께 복제됩니다. 복제된 미션은 비활성 상태로 생성되며, 제목
              끝에 " - 복사본"이 추가됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={duplicateMission.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDuplicate}
              disabled={duplicateMission.isPending}
            >
              {duplicateMission.isPending ? "복제 중..." : "복제하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>미션을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다. 미션과 관련된 모든 데이터가 삭제됩니다.
              <br />
              정말로 삭제하려면 아래에 <strong>"삭제"</strong>를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            placeholder="삭제"
            disabled={deleteMission.isPending}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMission.isPending}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!isDeleteButtonEnabled || deleteMission.isPending}
            >
              {deleteMission.isPending ? "삭제 중..." : "삭제하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
