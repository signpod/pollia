"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useMissionRewardVisibility, useSurveyResume } from "@/hooks/mission";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { cleanTiptapHTML } from "@/lib/utils";
import { FixedBottomLayout, FloatingButton, Typo } from "@repo/ui/components";
import { Gift } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MissionCollection,
  MissionDescription,
  MissionImage,
  MissionLogo,
  MissionReward,
} from "./components";
import { BottomButton } from "./ui";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { useEffect } from "react";

export function MissionIntro({ initialError }: { initialError: AuthError | null }) {
  const { missionId } = useParams<{ missionId: string }>();

  useEffect(() => {
    const existingValue = getSessionStorage(`current-action-id-${missionId}`);
    if (!existingValue) {
      setSessionStorage(`current-action-id-${missionId}`, "initial");
    }
  }, [missionId]);

  const { mission, firstActionId, isEnabledToResume, nextActionId, isCompleted, missionResponse } =
    useMissionIntroData(missionId);

  const { showResumeModal } = useSurveyResume({
    isEnabledToResume,
    nextActionId,
    firstActionId,
    missionId,
    responseId: missionResponse?.id ?? "",
  });

  const { isRewardVisible, setIsRewardVisible, rewardRef, scrollToReward } =
    useMissionRewardVisibility();

  const { brandLogoUrl, title, estimatedMinutes, deadline, imageUrl, description, target } =
    mission ?? {};

  const { data: reward } = useReadReward(mission?.rewardId || "");

  return (
    <>
      <main className="flex w-full flex-col gap-8 p-5">
        <div className="flex w-full flex-col gap-2">
          <MissionLogo logoUrl={brandLogoUrl ?? undefined} />

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-2">
              <Typo.MainTitle size="medium">{title}</Typo.MainTitle>

              <MissionCollection
                deadline={deadline ?? undefined}
                estimatedMinutes={estimatedMinutes ?? undefined}
                target={target ?? undefined}
              />
            </div>
            {imageUrl && <MissionImage imageUrl={imageUrl} />}
            <MissionDescription content={cleanTiptapHTML(description || "")} />
          </div>
        </div>

        <div ref={rewardRef}>
          {reward && (
            <MissionReward
              rewardName={reward?.data.name ?? ""}
              rewardImage={reward?.data.imageUrl ?? undefined}
              rewardDescription={reward?.data.description ?? undefined}
              onVisibilityChange={setIsRewardVisible}
            />
          )}
        </div>

        <FixedBottomLayout.Content className="flex w-full justify-end bg-transparent ">
          <div
            className={`absolute right-5 top-[-56px] flex flex-col gap-4 transition-opacity duration-150 ${
              !isRewardVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <FloatingButton
              variant="tertiary"
              icon={Gift}
              className="bg-white"
              onClick={scrollToReward}
            />
          </div>
          <BottomButton
            firstActionId={firstActionId ?? ""}
            initialError={initialError}
            deadline={deadline}
            showResumeModal={showResumeModal}
            isCompleted={isCompleted}
            hasReward={!!reward}
          />
        </FixedBottomLayout.Content>
      </main>
      <div className="flex justify-center">
        <Link
          href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400"
        >
          <Typo.Body size="small">개인정보처리방침</Typo.Body>
        </Link>
      </div>
    </>
  );
}
