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
import { useState } from "react";
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

  if (typeof window !== "undefined") {
    const existingValue = getSessionStorage(`current-action-id-${missionId}`);
    if (!existingValue) {
      setSessionStorage(`current-action-id-${missionId}`, "initial");
    }
  }

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
  const [activeTab, setActiveTab] = useState<string>("mission-guide");

  const handleChangeTab = (value: string) => {
    setActiveTab(value);
    const element = document.getElementById(value);
    if (element) {
      window.history.pushState(null, "", `#${value}`);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <main className="flex w-full flex-col gap-8">
        <div className="relative">
          {imageUrl && (
            <div className="overflow-hidden sticky top-0 left-0 right-0 z-0">
              <div className="bg-linear-to-t from-black/25 to-transparent h-[52px] absolute bottom-0 left-0 right-0 z-10" />
              <MissionImage imageUrl={imageUrl} />
            </div>
          )}
          <div className="flex w-full flex-col bg-white py-5 rounded-md pb-0 relative z-10 mt-[-20px]">
            <div className="sticky top-0 z-10 rounded-t-md mt-[-20px] bg-white px-5">
              <Tab.Root value={activeTab} pointColor="secondary" onValueChange={handleChangeTab}>
                <Tab.List>
                  <Tab.Item value="mission-guide">미션 안내</Tab.Item>
                  <Tab.Item value="reward">참여 혜택</Tab.Item>
                  <Tab.Item value="participation-method">참여 방법</Tab.Item>
                </Tab.List>
              </Tab.Root>
            </div>

            {/* mission-guide */}
            <div
              id="mission-guide"
              className="flex w-full flex-col gap-8 rounded-3xl px-5 py-8 items-center"
            >
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

            <div id="reward">
              <MissionRewardSection
                rewardImageUrl={reward?.data.imageUrl ?? undefined}
                rewardName={reward?.data.name ?? undefined}
                rewardPaymentType={reward?.data.paymentType ?? undefined}
                brandLogoUrl={brandLogoUrl ?? undefined}
              />
            </div>

            <div id="participation-method">
              <ParticipationMethodSection
                steps={[
                  { title: "참여 방법1", description: "참여 방법1입니다." },
                  { title: "참여 방법2", description: "참여 방법2입니다." },
                  { title: "참여 방법2", description: "참여 방법2입니다." },
                ]}
              />
            </div>
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
