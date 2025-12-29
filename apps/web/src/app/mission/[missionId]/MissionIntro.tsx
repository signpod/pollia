"use client";
import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSectionScrollSync, useSurveyResume } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { useMissionShare } from "@/hooks/share/useMissionShare";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import Gift from "@public/svgs/gift.svg";
import Lock from "@public/svgs/lock.svg";
import {
  CalloutProvider,
  type CalloutToneVariant,
  FixedBottomLayout,
  Tab,
  Typo,
  useCallout,
} from "@repo/ui/components";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
  MissionBadge,
  MissionDescription,
  MissionFooter,
  MissionImage,
  MissionLogo,
  MissionRewardSection,
  SectionHeader,
  SocialShareButtons,
} from "./components";
import { BottomButton } from "./ui";
import { checkParticipantLimitReached } from "./utils/checkParticipantLimit";
import { formatDeadline } from "./utils/formatDeadline";

const SECTION_IDS = {
  MISSION_GUIDE: "mission-guide",
  REWARD: "reward",
} as const;

const SCROLL_OFFSET = (sectionId: string) => {
  if (sectionId === SECTION_IDS.MISSION_GUIDE) {
    return 60;
  }
  return 10;
};
const DRAWER_VISIBLE_HEIGHT = 120;

function CalloutTrigger({
  calloutData,
}: {
  calloutData: { variant: CalloutToneVariant; description: string } | null;
}) {
  const { show } = useCallout();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (calloutData && !hasShownRef.current) {
      hasShownRef.current = true;
      show({
        description: calloutData.description,
        variant: calloutData.variant,
        duration: Number.POSITIVE_INFINITY,
      });
    }
  }, [calloutData, show]);

  return null;
}

export function MissionIntro({ initialError }: { initialError: AuthError | null }) {
  const { missionId } = useParams<{ missionId: string }>();

  useEffect(() => {
    window.scrollTo(0, -30);
  }, []);

  useEffect(() => {
    const existingValue = getSessionStorage(`current-action-id-${missionId}`);
    if (!existingValue) {
      setSessionStorage(`current-action-id-${missionId}`, "initial");
    }
  }, [missionId]);

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
    isActive,
  } = mission ?? {};

  const { data: reward } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const { handleKakaoShare, handleLinkShare, handleXShare } = useMissionShare({
    missionId,
    title: title ?? undefined,
    imageUrl: imageUrl ?? undefined,
  });

  const sections = reward
    ? [SECTION_IDS.MISSION_GUIDE, SECTION_IDS.REWARD]
    : [SECTION_IDS.MISSION_GUIDE];

  const { activeTab, handleChangeTab } = useSectionScrollSync({
    sections,
    defaultSection: SECTION_IDS.MISSION_GUIDE,
    scrollOffset: SCROLL_OFFSET,
  });

  const showDetailInfo = !!target || !!estimatedMinutes || !!deadline;

  const deadlineText = deadline ? `${formatDeadline(deadline)} 까지` : "정원 마감시";

  const detailInfoConfig = [
    { key: "참여 조건", value: target },
    { key: "예상 소요 시간", value: `${estimatedMinutes}분` },
    { key: "참여 기간", value: deadlineText },
  ] as const;

  const hasReward = !!reward?.data.id;

  const isProcessing = Boolean(missionResponseData?.data?.id);

  const calloutData = useMemo<{ variant: CalloutToneVariant; description: string } | null>(() => {
    const isLimitReached = checkParticipantLimitReached({
      maxParticipants,
      currentParticipants,
      hasExistingResponse: isProcessing,
    });

    if (isLimitReached) {
      return {
        variant: "notice",
        description: "정원이 마감되어, 이미 참여한 분들만 진행 가능해요.",
      };
    }
    if (
      currentParticipants &&
      maxParticipants &&
      currentParticipants / maxParticipants >= 0.9 &&
      !isProcessing
    ) {
      return {
        variant: "high-urgency",
        description: reward?.data.id
          ? `🚨 남은 리워드 단 ${maxParticipants - currentParticipants}개! 사라지기 전에 받아보세요`
          : `🚨 남은 인원 단 ${maxParticipants - currentParticipants}명! 빠르게 참여해보세요`,
      };
    }
    if (
      currentParticipants &&
      maxParticipants &&
      currentParticipants / maxParticipants >= 0.5 &&
      !isProcessing
    ) {
      return {
        variant: "early-urgency",
        description: reward?.data.id
          ? "리워드가 빠르게 줄고 있어요! 바로 참여해보세요"
          : "참여자가 많은 인기 미션이에요! 바로 참여해보세요",
      };
    }
    return null;
  }, [currentParticipants, maxParticipants, reward?.data.id, isProcessing]);

  return (
    <CalloutProvider position="top-center">
      <CalloutTrigger calloutData={calloutData} />
      <main className="flex w-full flex-col gap-8">
        <div className="relative">
          {imageUrl && (
            <div
              className="overflow-hidden sticky top-0 left-0 right-0 z-10 bg-white"
              style={{ height: `calc(100dvh - ${DRAWER_VISIBLE_HEIGHT}px)` }}
            >
              <MissionImage imageUrl={imageUrl} />
            </div>
          )}
          <div className="flex w-full flex-col bg-white py-5 rounded-t-3xl pb-0 relative z-20 mt-[-20px] overflow-visible">
            <div className="bg-linear-to-t from-black via-black/50 via-70% to-transparent absolute bottom-[calc(100%-10px)] left-0 right-0 z-30 flex flex-col gap-3 pb-2 pt-6 px-5 pointer-events-none">
              <MissionLogo logoUrl={brandLogoUrl ?? undefined} />
              <Typo.MainTitle size="large" className="break-keep text-white">
                {title}
              </Typo.MainTitle>

              <div className="flex gap-3 items-center">
                {isRequirePassword && <MissionBadge icon={<Lock />} label="비밀" />}
                {hasReward && <MissionBadge icon={<Gift />} label="리워드" />}
              </div>

              <div className="h-[84px]" />
            </div>
            <div className="bg-white h-5 absolute top-0 left-0 right-0 rounded-t-3xl z-30" />
            <div className="sticky top-0 z-30 rounded-t-md mt-[-20px] bg-white py-2">
              <div className="h-1 w-9 rounded-md bg-zinc-300 mx-auto" />
              <Tab.Root value={activeTab} pointColor="secondary" onValueChange={handleChangeTab}>
                <Tab.List className="px-5">
                  <Tab.Item
                    value={SECTION_IDS.MISSION_GUIDE}
                    className={cn(sections.length === 1 ? "mx-auto max-w-[110px]" : "")}
                    onClick={() => handleChangeTab(SECTION_IDS.MISSION_GUIDE)}
                  >
                    <Typo.SubTitle size="large">상세 안내</Typo.SubTitle>
                  </Tab.Item>
                  {reward && (
                    <Tab.Item
                      value={SECTION_IDS.REWARD}
                      onClick={() => handleChangeTab(SECTION_IDS.REWARD)}
                    >
                      <Typo.SubTitle size="large">참여 혜택</Typo.SubTitle>
                    </Tab.Item>
                  )}
                </Tab.List>
              </Tab.Root>
            </div>

            <div
              id={SECTION_IDS.MISSION_GUIDE}
              className="flex w-full flex-col gap-0 px-5 items-center"
            >
              {showDetailInfo && (
                <div className="flex flex-col gap-6 w-full p-5">
                  <div className="flex flex-col gap-4 w-full bg-zinc-50 rounded-md p-6">
                    {detailInfoConfig.map(
                      ({ key, value }) =>
                        key &&
                        value && (
                          <div className="flex gap-2" key={key}>
                            <Typo.Body
                              size="medium"
                              className="text-info whitespace-nowrap min-w-[100px]"
                            >
                              {key}
                            </Typo.Body>
                            <Typo.Body size="medium" className="flex-1 break-keep text-right">
                              {value}
                            </Typo.Body>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {!!description && !!cleanTiptapHTML(description) && (
                <div className="flex flex-col gap-6 px-5 py-8 items-center w-full">
                  <SectionHeader badgeText="상세 안내" title={""} />
                  <MissionDescription
                    content={cleanTiptapHTML(description)}
                    className="text-center"
                  />
                </div>
              )}
            </div>

            {reward && (
              <div id={SECTION_IDS.REWARD} className="px-5 py-8 w-full">
                <MissionRewardSection
                  rewardImageUrl={reward?.data.imageUrl ?? undefined}
                  rewardName={reward?.data.name ?? undefined}
                  rewardScheduledDate={reward?.data.scheduledDate ?? undefined}
                />
              </div>
            )}

            {mission?.type !== MissionType.EXPERIENCE_GROUP && (
              <div className="flex flex-col gap-4 items-center px-5 py-8">
                <Typo.MainTitle size="small" className="text-center">
                  가족, 친구에게
                  <br />
                  공유해주세요 👀
                </Typo.MainTitle>
                <SocialShareButtons
                  onXShare={handleXShare}
                  onKakaoShare={handleKakaoShare}
                  onLinkShare={handleLinkShare}
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
            hasExistingResponse={!!missionResponse}
          />
        </FixedBottomLayout.Content>
      </main>
      <MissionFooter />
    </CalloutProvider>
  );
}
