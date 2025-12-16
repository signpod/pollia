"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { cleanTiptapHTML } from "@/lib/utils";
import { FixedBottomLayout, Tab, Typo } from "@repo/ui/components";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  MissionDescription,
  MissionImage,
  MissionLogo,
  MissionRewardSection,
  ParticipantCount,
  ParticipationMethodSection,
} from "./components";
import { formatDeadline } from "./done/ui/utils/formatDeadline";
import { BottomButton } from "./ui";

export function MissionIntro({ initialError }: { initialError: AuthError | null }) {
  const { missionId } = useParams<{ missionId: string }>();

  useEffect(() => {
    if (typeof window === "undefined") return;

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

  const {
    brandLogoUrl,
    title,
    estimatedMinutes,
    deadline,
    imageUrl,
    description,
    target,
    createdAt,
  } = mission ?? {};

  const { data: reward } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  // const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};
  const { currentParticipants } = participantInfo?.data ?? {};
  const maxParticipants = 200;

  return (
    <>
      <main className="flex w-full flex-col gap-8 overflow-hidden">
        <div className="relative">
          {imageUrl && (
            <div>
              <MissionImage imageUrl={imageUrl} />
            </div>
          )}
          <div className="sticky top-0 z-10 flex w-full flex-col bg-white py-5 pb-0 rounded-md mt-[-20px] shadow-[0_-18px_50px_rgba(0,0,0,0.25)]">
            <Tab.Root defaultValue="description" pointColor="secondary">
              <Tab.List>
                <Tab.Item value="description">미션 안내</Tab.Item>
                <Tab.Item value="collection">참여 혜택</Tab.Item>
                <Tab.Item value="review">참여 방법</Tab.Item>
              </Tab.List>
            </Tab.Root>

            {/* description */}
            <div className="flex w-full flex-col gap-8 rounded-3xl px-5 py-8 items-center">
              <div className="flex w-full flex-col gap-6">
                <MissionLogo logoUrl={brandLogoUrl ?? undefined} />

                <Typo.MainTitle size="large" className="break-keep text-center">
                  {title}
                </Typo.MainTitle>

                <MissionDescription content={cleanTiptapHTML(description || "")} />
              </div>

              <div className="flex flex-col gap-1 items-center">
                <Typo.SubTitle size="large">미션 기간</Typo.SubTitle>
                <Typo.Body
                  size="small"
                  className="text-info"
                >{`${formatDeadline(createdAt ?? "")} ~ ${formatDeadline(deadline ?? "")}`}</Typo.Body>
              </div>

              <ParticipantCount current={currentParticipants ?? 0} max={maxParticipants} />
            </div>

            <MissionRewardSection
              rewardImageUrl={reward?.data.imageUrl ?? undefined}
              rewardName={reward?.data.name ?? undefined}
              brandLogoUrl={brandLogoUrl ?? undefined}
            />

            <ParticipationMethodSection
              steps={[
                { title: "참여 방법1", description: "참여 방법1입니다." },
                { title: "참여 방법2", description: "참여 방법2입니다." },
                { title: "참여 방법2", description: "참여 방법2입니다." },
              ]}
            />
          </div>
        </div>

        <FixedBottomLayout.Content className="flex w-full justify-end">
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
