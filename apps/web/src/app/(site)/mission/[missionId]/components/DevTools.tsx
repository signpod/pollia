"use client";

import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useResetMissionResponse } from "@/hooks/mission-response/useResetMissionResponse";
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
  const { data: missionResponse, isLoading: isLoadingResponse } = useReadMissionResponseForMission({
    missionId,
  });
  const { mutate: resetResponse, isPending: isResetting } = useResetMissionResponse({ missionId });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isDevEnvironment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "dev.pollia.me");

  if (!hasMounted || !isDevEnvironment) {
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
        className="fixed bottom-40 right-4 z-9998 flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-800 px-4 text-white shadow-lg transition-colors hover:bg-zinc-700 active:bg-zinc-900"
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
        <div className="fixed bottom-56 right-4 z-9998 w-72 overflow-hidden rounded-xl border border-default bg-white text-default shadow-2xl">
          <div className="flex items-center justify-between bg-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <PollPollE className="size-5 text-white" />
              <Typo.SubTitle size="large" className="text-white">
                Dev Tools
              </Typo.SubTitle>
            </div>
          </div>

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
                    <span className="text-sm text-default">
                      {isCompleted ? "완료됨" : "진행 중"}
                    </span>
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
              onClick={handleDeleteResponse}
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
          </div>
        </div>
      )}
    </>
  );
}
