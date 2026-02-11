"use client";

import { MissionLikeButton } from "@/app/(main)/components/MissionLikeButton";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import { useResumeToNextAction } from "@/hooks/mission/useResumeToNextAction";
import { setActionNavCookie } from "@/lib/cookie";
import type { MyMissionResponse, MyMissionResponseAnswer } from "@/types/dto/mission-response";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDeleteMissionResponse } from "../hooks/useDeleteMissionResponse";

export type MeProjectCardVariant = "in-progress" | "completed" | "expired";

interface MeProjectCardProps {
  response: MyMissionResponse;
  variant: MeProjectCardVariant;
}

function resolveCompletionId(answers: MyMissionResponseAnswer[]): string | undefined {
  for (const answer of answers) {
    for (const option of answer.options) {
      if (option.nextCompletionId) return option.nextCompletionId;
    }
    if (answer.action.nextCompletionId) return answer.action.nextCompletionId;
  }
  return undefined;
}

function CardAction({
  response,
  variant,
}: { response: MyMissionResponse; variant: MeProjectCardVariant }) {
  const { nextActionId } = useResumeToNextAction({
    missionId: response.mission.id,
    answers: response.answers,
  });
  const deleteMutation = useDeleteMissionResponse();

  const handleOpenInNewTab = useCallback(() => {
    const missionId = response.mission.id;
    if (variant === "in-progress") {
      if (!nextActionId) return;
      setActionNavCookie(missionId, "resume");
      window.open(ROUTES.ACTION({ missionId, actionId: nextActionId }), "_blank");
    } else {
      const completionId = resolveCompletionId(response.answers);
      window.open(ROUTES.MISSION_DONE(missionId, completionId), "_blank");
    }
  }, [response, variant, nextActionId]);

  if (variant === "expired") {
    return (
      <ButtonV2
        variant="secondary"
        size="medium"
        onClick={() => deleteMutation.mutate(response.id)}
        disabled={deleteMutation.isPending}
        className="w-full"
      >
        <div className="flex w-full items-center justify-center">
          <Typo.ButtonText size="medium" className="text-red-500">
            삭제하기
          </Typo.ButtonText>
        </div>
      </ButtonV2>
    );
  }

  return (
    <ButtonV2
      variant="secondary"
      size="medium"
      onClick={handleOpenInNewTab}
      className="w-full"
    >
      <div className="flex w-full items-center justify-center">
        <Typo.ButtonText size="medium">
          {variant === "in-progress" ? "이어하기" : "결과 다시보기"}
        </Typo.ButtonText>
      </div>
    </ButtonV2>
  );
}

function formatCompletedDate(date: Date): string {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd} 응답`;
}

export function MeProjectCard({ response, variant }: MeProjectCardProps) {
  const { mission } = response;
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel = MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ?? mission.category;
  const isCompleted = variant === "completed";

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-100">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-16 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={mission.imageUrl ?? ""}
            alt={mission.title}
            fill
            sizes="(max-width: 600px) 50vw, 300px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <MissionLikeButton missionId={mission.id} className="absolute bottom-3 right-3" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Typo.Body size="small" className="text-info">{categoryLabel}</Typo.Body>
          <Typo.SubTitle size="large" className="line-clamp-2 min-h-[48px] text-default">
            {mission.title}
          </Typo.SubTitle>
        </div>
        {isCompleted && response.completedAt && (
          <span className="w-fit rounded-[6px] bg-zinc-100 px-2 py-1">
            <Typo.Body size="small">{formatCompletedDate(response.completedAt)}</Typo.Body>
          </span>
        )}
        <CardAction response={response} variant={variant} />
      </div>
    </div>
  );
}
