"use client";

import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useResetMissionResponse } from "@/hooks/mission-response/useResetMissionResponse";
import { useCurrentUser } from "@/hooks/user";
import { UserRole } from "@prisma/client";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon, Loader2Icon, SettingsIcon, TrashIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminToolbarProps {
  missionId?: string;
}

export function AdminToolbar({ missionId }: AdminToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  if (!hasMounted || !isAdmin) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-24 right-4 z-9999 flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-800 px-4 text-white shadow-lg transition-colors hover:bg-zinc-700 active:bg-zinc-900"
        aria-label="관리자 도구 열기"
      >
        {isOpen ? (
          <XIcon className="size-5" />
        ) : (
          <>
            <PollPollE className="size-5" />
            <span className="text-sm font-medium">Admin</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 right-4 z-9999 w-72 overflow-hidden rounded-xl border border-default bg-white text-default shadow-2xl">
          <div className="flex items-center justify-between bg-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <PollPollE className="size-5 text-white" />
              <Typo.SubTitle size="large" className="text-white">
                Admin Tools
              </Typo.SubTitle>
            </div>
          </div>

          <div className="flex flex-col">
            <Link
              href="/admin/v2/"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-default transition-colors hover:bg-zinc-50"
              onClick={() => setIsOpen(false)}
            >
              <SettingsIcon className="size-4 text-zinc-500" />
              관리자 페이지
              <ExternalLinkIcon className="ml-auto size-3.5 text-zinc-400" />
            </Link>

            {missionId && (
              <>
                <div className="h-px bg-divider-default" />
                <MissionDevTools missionId={missionId} onClose={() => setIsOpen(false)} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface MissionDevToolsProps {
  missionId: string;
  onClose: () => void;
}

function MissionDevTools({ missionId, onClose }: MissionDevToolsProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: missionResponse, isLoading: isLoadingResponse } = useReadMissionResponseForMission({
    missionId,
  });
  const { mutate: resetResponse, isPending: isResetting } = useResetMissionResponse({ missionId });

  const response = missionResponse?.data;
  const hasResponse = !!response;
  const isCompleted = !!response?.completedAt;
  const answersCount = response?.answers?.length ?? 0;

  const handleDeleteResponse = () => {
    if (!response?.id) return;

    resetResponse(response.id, {
      onSuccess: async () => {
        setConfirmOpen(false);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.missionParticipant(missionId),
          }),
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.missionResponseForMission(missionId),
          }),
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.mission(missionId),
          }),
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.userAnswerStatus(missionId),
          }),
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.missionPassword(missionId),
          }),
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.all(),
          }),
          queryClient.invalidateQueries({
            queryKey: missionQueryKeys.userMissions(),
          }),
        ]);
        toast.success("응답이 초기화되었습니다");
        onClose();
      },
      onError: () => {
        toast.warning("응답 초기화에 실패했습니다");
      },
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Typo.Body size="small" className="text-info">
          Mission ID
        </Typo.Body>
        <code className="block break-all rounded bg-light px-2 py-1.5 font-mono text-xs text-point">
          {missionId}
        </code>
      </div>

      <div className="h-px bg-divider-default" />

      <div className="space-y-2">
        <Typo.Body size="small" className="text-info">
          응답 상태
        </Typo.Body>
        {isLoadingResponse ? (
          <div className="flex items-center gap-2 text-info">
            <Loader2Icon className="size-4 animate-spin" />
            <span className="text-sm">로딩 중...</span>
          </div>
        ) : hasResponse ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-violet-500"}`}
              />
              <span className="text-sm text-default">{isCompleted ? "완료됨" : "진행 중"}</span>
            </div>
            <div className="text-xs text-info">답변 수: {answersCount}개</div>
            <code className="block break-all rounded bg-light px-2 py-1 font-mono text-xs text-sub">
              ID: {response.id}
            </code>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-info">
            <span className="size-2 rounded-full bg-zinc-300" />
            <span className="text-sm">응답 없음</span>
          </div>
        )}
      </div>

      <div className="h-px bg-divider-default" />

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={!hasResponse || isResetting}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-800 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 active:bg-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-disabled"
      >
        {isResetting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <TrashIcon className="size-4" />
        )}
        초기화하기
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-xl bg-white p-5 shadow-xl">
            <Typo.SubTitle className="text-default">응답 초기화</Typo.SubTitle>
            <Typo.Body size="small" className="mt-2 text-sub">
              정말로 이 컨텐츠의 응답을 초기화하시겠습니까?
            </Typo.Body>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isResetting}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-default transition-colors hover:bg-zinc-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteResponse}
                disabled={isResetting}
                className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                {isResetting && <Loader2Icon className="size-3.5 animate-spin" />}
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
