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
import { Loader2Icon, TrashIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface DevToolsProps {
  missionId: string;
}

export function DevTools({ missionId }: DevToolsProps) {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { data: missionResponse, isLoading: isLoadingResponse } = useReadMissionResponseForMission({
    missionId,
  });
  const { mutate: resetResponse, isPending: isResetting } = useResetMissionResponse({ missionId });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isDevEnvironment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "dev.pollia.me");

  if (!hasMounted || !isAdmin || !isDevEnvironment) {
    return null;
  }

  const response = missionResponse?.data;
  const hasResponse = !!response;
  const isCompleted = !!response?.completedAt;
  const answersCount = response?.answers?.length ?? 0;

  const handleDeleteResponse = () => {
    if (!response?.id) return;

    if (window.confirm("정말로 이 컨텐츠의 응답을 초기화하시겠습니까?")) {
      resetResponse(response.id, {
        onSuccess: async () => {
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
          setIsOpen(false);
        },
        onError: () => {
          toast.warning("응답 초기화에 실패했습니다");
        },
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-24 right-4 z-9999 h-12 px-4 rounded-full bg-zinc-800 text-white shadow-lg flex items-center justify-center gap-2 hover:bg-zinc-700 active:bg-zinc-900 transition-colors"
        aria-label="개발 도구 열기"
      >
        {isOpen ? (
          <XIcon className="size-5" />
        ) : (
          <>
            <PollPollE className="size-5" />
            <span className="text-sm font-medium">응답 초기화</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 right-4 z-9999 w-72 rounded-xl bg-white text-default shadow-2xl border border-default overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-800">
            <div className="flex items-center gap-2">
              <PollPollE className="size-5 text-white" />
              <Typo.SubTitle size="large" className="text-white">
                Dev Tools
              </Typo.SubTitle>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Typo.Body size="small" className="text-info">
                Mission ID
              </Typo.Body>
              <code className="block text-xs bg-light px-2 py-1.5 rounded font-mono text-point break-all">
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
                    <span className="text-sm text-default">
                      {isCompleted ? "완료됨" : "진행 중"}
                    </span>
                  </div>
                  <div className="text-xs text-info">답변 수: {answersCount}개</div>
                  <code className="block text-xs bg-light px-2 py-1 rounded font-mono text-sub break-all">
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
              onClick={handleDeleteResponse}
              disabled={!hasResponse || isResetting}
              className="w-full h-10 px-4 rounded-md bg-zinc-800 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-700 active:bg-zinc-900 disabled:bg-zinc-100 disabled:text-disabled disabled:cursor-not-allowed transition-colors"
            >
              {isResetting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              초기화하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
