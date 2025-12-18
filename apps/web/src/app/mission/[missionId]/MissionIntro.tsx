"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSectionScrollSync, useSurveyResume } from "@/hooks/mission";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { FixedBottomLayout, Tab, Typo } from "@repo/ui/components";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import {
  MissionDescription,
  MissionFooter,
  MissionImage,
  MissionLogo,
  MissionRewardSection,
  ParticipantCount,
} from "./components";
import { formatDeadline } from "./done/ui/utils/formatDeadline";
import { BottomButton } from "./ui";

const SECTION_IDS = {
  MISSION_GUIDE: "mission-guide",
  REWARD: "reward",
} as const;

const SCROLL_OFFSET = 30;

export function MissionIntro({ initialError }: { initialError: AuthError | null }) {
  const { missionId } = useParams<{ missionId: string }>();

  useEffect(() => {
    window.scrollTo(0, -30);
  }, []);

  if (typeof window !== "undefined") {
    const existingValue = getSessionStorage(`current-action-id-${missionId}`);
    if (!existingValue) {
      setSessionStorage(`current-action-id-${missionId}`, "initial");
    }
  }

  const {
    mission,
    firstActionId,
    isEnabledToResume,
    nextActionId,
    isCompleted,
    missionResponse,
    isRequirePassword,
  } = useMissionIntroData(missionId);

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
    isActive,
  } = mission ?? {};

  const { data: reward } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const sections = reward
    ? [SECTION_IDS.MISSION_GUIDE, SECTION_IDS.REWARD]
    : [SECTION_IDS.MISSION_GUIDE];

  const { activeTab, handleChangeTab } = useSectionScrollSync({
    sections,
    defaultSection: SECTION_IDS.MISSION_GUIDE,
    scrollOffset: SCROLL_OFFSET,
  });

  const deadlineText = deadline ? formatDeadline(deadline) : "정원 마감시";

  return (
    <>
      <main className="flex w-full flex-col gap-8">
        <div className="relative">
          {imageUrl && (
            <div className="overflow-hidden sticky top-0 left-0 right-0 z-10 bg-white">
              <MissionImage imageUrl={imageUrl} />
            </div>
          )}
          <div className="flex w-full flex-col bg-white py-5 rounded-t-3xl pb-0 relative z-10 mt-[-20px]">
            <div className="bg-white h-5 absolute top-0 left-0 right-0  rounded-t-3xl z-30" />
            <div className="bg-linear-to-t from-black/25 to-transparent h-[50px] absolute top-[-30px] left-0 right-0 z-20" />
            <div className="sticky top-0 z-30 rounded-t-md mt-[-20px] bg-white px-5">
              <Tab.Root value={activeTab} pointColor="secondary" onValueChange={handleChangeTab}>
                <Tab.List>
                  <Tab.Item
                    value={SECTION_IDS.MISSION_GUIDE}
                    className={cn(sections.length === 1 ? "mx-auto max-w-[110px]" : "")}
                  >
                    <Typo.SubTitle size="large">미션 안내</Typo.SubTitle>
                  </Tab.Item>
                  {reward && (
                    <Tab.Item value={SECTION_IDS.REWARD}>
                      <Typo.SubTitle size="large">참여 혜택</Typo.SubTitle>
                    </Tab.Item>
                  )}
                </Tab.List>
              </Tab.Root>
            </div>

            <div
              id={SECTION_IDS.MISSION_GUIDE}
              className="flex w-full flex-col gap-8 px-5 py-8 items-center"
            >
              <div className="flex w-full flex-col gap-6">
                <MissionLogo logoUrl={brandLogoUrl ?? undefined} />

                <Typo.MainTitle size="large" className="break-keep text-center">
                  {title}
                </Typo.MainTitle>

                <MissionDescription
                  content={cleanTiptapHTML(description || "")}
                  className="text-center"
                />
              </div>

              <div className="flex flex-col gap-1 items-center">
                <Typo.SubTitle size="large">미션 조건</Typo.SubTitle>
                <Typo.Body size="medium" className="text-info">
                  {target}
                </Typo.Body>
              </div>

              <div className="flex flex-col gap-1 items-center">
                <Typo.SubTitle size="large">미션 소요 시간</Typo.SubTitle>
                <Typo.Body size="medium" className="text-info">
                  {estimatedMinutes}분
                </Typo.Body>
              </div>

              <div className="flex flex-col gap-1 items-center">
                <Typo.SubTitle size="large">미션 기간</Typo.SubTitle>
                <Typo.Body
                  size="medium"
                  className="text-info"
                >{`${formatDeadline(createdAt ?? "")} ~ ${deadlineText}`}</Typo.Body>
              </div>

              {maxParticipants && (
                <ParticipantCount current={currentParticipants ?? 0} max={maxParticipants} />
              )}
            </div>

            {reward && (
              <div id={SECTION_IDS.REWARD}>
                <MissionRewardSection
                  rewardImageUrl={reward?.data.imageUrl ?? undefined}
                  rewardName={reward?.data.name ?? undefined}
                  rewardPaymentType={reward?.data.paymentType ?? undefined}
                  brandLogoUrl={brandLogoUrl ?? undefined}
                />
              </div>
            )}

            {/* TODO: 참여 방법 추가 시 실제 데이터 사용 */}
            {/* <div id="participation-method">
              <ParticipationMethodSection
                steps={[
                  {
                    title: "전용 링크로 제품 구매하기",
                    description:
                      "전용 구매 링크를 통해 ‘스타벅스 홀리데이 블론드 로스트’를 구매해주세요!",
                  },
                  {
                    title: "구매 사진 인증하기",
                    description: "제품을 받고 영수증과 사진 인증을 진행해주세요!",
                  },
                  {
                    title: "사용 후기 작성하기",
                    description: "일주일 사용 후, 미션 페이지로 다시 돌아와서 후기 작성하면 끝!",
                  },
                ]}
              />
            </div> */}
          </div>
        </div>

        <FixedBottomLayout.Content className="flex w-full justify-end">
          <BottomButton
            isActive={isActive ?? false}
            firstActionId={firstActionId ?? ""}
            initialError={initialError}
            deadline={deadline}
            showResumeModal={showResumeModal}
            isCompleted={isCompleted}
            hasReward={!!reward}
            isRequirePassword={isRequirePassword}
          />
        </FixedBottomLayout.Content>
      </main>
      <MissionFooter />
    </>
  );
}
