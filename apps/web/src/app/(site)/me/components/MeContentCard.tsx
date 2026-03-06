"use client";

import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import { useResumeToNextAction } from "@/hooks/mission/useResumeToNextAction";
import { setActionNavCookie } from "@/lib/cookie";
import { cn } from "@/lib/utils";
import type { MyMissionResponse, MyMissionResponseAnswer } from "@/types/dto/mission-response";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import { ButtonV2, Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

export type MeContentCardVariant = "in-progress" | "completed" | "expired";

interface MeContentCardProps {
  response: MyMissionResponse;
  variant: MeContentCardVariant;
  lineClamp?: number;
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
}: { response: MyMissionResponse; variant: MeContentCardVariant }) {
  const { nextActionId } = useResumeToNextAction({
    missionId: response.mission.id,
    answers: response.answers,
  });
  const handleOpenInNewTab = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
      const missionId = response.mission.id;
      if (variant === "in-progress") {
        if (!nextActionId) return;
        setActionNavCookie(missionId, "resume");
        window.open(ROUTES.ACTION({ missionId, actionId: nextActionId }), "_blank");
      } else {
        const completionId = resolveCompletionId(response.answers);
        window.open(ROUTES.MISSION_DONE(missionId, completionId), "_blank");
      }
    },
    [response, variant, nextActionId],
  );

  if (variant === "expired") {
    return (
      <>
        <ButtonV2 variant="secondary" size="medium" disabled className="w-full sm:hidden">
          <div className="flex w-full items-center justify-center">
            <Typo.ButtonText size="medium" className="text-disabled">
              마감
            </Typo.ButtonText>
          </div>
        </ButtonV2>
        <ButtonV2 variant="secondary" size="large" disabled className="hidden w-full sm:block">
          <div className="flex w-full items-center justify-center">
            <Typo.ButtonText size="large" className="text-disabled">
              마감
            </Typo.ButtonText>
          </div>
        </ButtonV2>
      </>
    );
  }

  return (
    <>
      <ButtonV2
        variant="secondary"
        size="medium"
        onClick={handleOpenInNewTab}
        className="w-full sm:hidden"
      >
        <div className="flex w-full items-center justify-center">
          <Typo.ButtonText size="medium">
            {variant === "in-progress" ? "이어하기" : "결과 다시보기"}
          </Typo.ButtonText>
        </div>
      </ButtonV2>
      <ButtonV2
        variant="secondary"
        size="large"
        onClick={handleOpenInNewTab}
        className="hidden w-full sm:block"
      >
        <div className="flex w-full items-center justify-center">
          <Typo.ButtonText size="large">
            {variant === "in-progress" ? "이어하기" : "결과 다시보기"}
          </Typo.ButtonText>
        </div>
      </ButtonV2>
    </>
  );
}

function formatCompletedDate(date: Date): string {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd} 완료`;
}

export function MeContentCard({ response, variant, lineClamp = 1 }: MeContentCardProps) {
  const { mission } = response;
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel =
    MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ??
    mission.category;
  const isCompleted = variant === "completed";
  const titleClassName = cn("text-default", lineClamp > 1 ? "line-clamp-2" : "line-clamp-1");

  return (
    <Link
      href={ROUTES.MISSION(mission.id)}
      className="flex flex-col overflow-hidden h-auto justify-between gap-3"
    >
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-100">
          <Image
            src={showFallback ? thumbnailFallback : (mission.imageUrl ?? "")}
            alt={mission.title}
            fill
            sizes="(max-width: 600px) 50vw, 300px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
          <MissionLikeButton missionId={mission.id} className="absolute bottom-3 right-3" />
        </div>
        <div className="flex flex-col gap-2">
          <Typo.Body size="small" className="text-info">
            {categoryLabel}
          </Typo.Body>
          <Typo.SubTitle size="large" className={titleClassName}>
            {mission.title}
          </Typo.SubTitle>

          {isCompleted && response.completedAt && (
            <span className="w-fit rounded-[6px] bg-zinc-100 px-2 py-1">
              <Typo.Body size="small" className="text-zinc-500">
                {formatCompletedDate(response.completedAt)}
              </Typo.Body>
            </span>
          )}
        </div>
      </div>

      <CardAction response={response} variant={variant} />
    </Link>
  );
}
