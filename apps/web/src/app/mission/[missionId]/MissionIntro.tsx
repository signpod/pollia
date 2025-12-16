"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useMissionRewardVisibility, useSurveyResume } from "@/hooks/mission";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { cleanTiptapHTML } from "@/lib/utils";
import { FixedBottomLayout, FloatingButton, Tab, Typo } from "@repo/ui/components";
import { Gift } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { MissionDescription, MissionImage, MissionLogo, MissionReward } from "./components";
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

  const { isRewardVisible, setIsRewardVisible, rewardRef, scrollToReward } =
    useMissionRewardVisibility();

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
          <div className="sticky top-0 z-10 flex w-full flex-col bg-white p-5 pb-0 rounded-md mt-[-20px] shadow-[0_-18px_50px_rgba(0,0,0,0.25)]">
            <Tab.Root defaultValue="description" pointColor="secondary">
              <Tab.List>
                <Tab.Item value="description">미션 안내</Tab.Item>
                <Tab.Item value="collection">참여 혜택</Tab.Item>
                <Tab.Item value="review">참여 방법</Tab.Item>
              </Tab.List>
            </Tab.Root>

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

              <div className="flex justify-between items-center px-6 py-4 rounded-md bg-zinc-700 w-[208px]">
                <Typo.Body size="medium" className="text-white">
                  남은 참여 인원
                </Typo.Body>
                <div className="flex gap-1 items-center">
                  <Typo.Body size="large" className="text-white">
                    {currentParticipants}명
                  </Typo.Body>
                  <Typo.Body
                    size="medium"
                    className="text-zinc-400"
                  >{`/${maxParticipants}명`}</Typo.Body>
                </div>
              </div>
            </div>
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

        <FixedBottomLayout.Content className="flex w-full justify-end">
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
