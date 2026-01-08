"use client";
import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { useMissionShare } from "@/hooks/share/useMissionShare";
import { getActionNavCookie, setActionNavCookie } from "@/lib/cookie";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import Gift from "@public/svgs/gift.svg";
import Lock from "@public/svgs/lock.svg";
import {
  BottomDrawer,
  CalloutProvider,
  type CalloutToneVariant,
  Tab,
  Typo,
  useBottomDrawer,
  useCallout,
} from "@repo/ui/components";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

const HANDLE_HEIGHT = 28;
const TAB_HEIGHT = 48;
const TOP_MARGIN = 40;

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
  const [drawerHeight, setDrawerHeight] = useState({ collapsed: 200, expanded: 400 });
  const bottomButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingValue = getActionNavCookie(missionId);
    if (!existingValue) {
      setActionNavCookie(missionId, "initial");
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

  const calculateDrawerHeight = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const containerWidth = Math.min(viewportWidth, 512);
    const imageMaxHeight = (containerWidth * 16) / 9;
    const extraHeight = Math.max(0, viewportHeight - imageMaxHeight);

    const bottomButtonHeight = bottomButtonRef.current?.offsetHeight ?? 110;
    const collapsed = HANDLE_HEIGHT + TAB_HEIGHT + bottomButtonHeight + extraHeight;
    const expanded = viewportHeight - TOP_MARGIN;
    setDrawerHeight({ collapsed, expanded });
  }, []);

  // Calculate drawer height before paint to avoid layout shift
  useLayoutEffect(() => {
    calculateDrawerHeight();
  }, [calculateDrawerHeight]);

  // Handle resize events
  useEffect(() => {
    window.addEventListener("resize", calculateDrawerHeight);

    const resizeObserver = new ResizeObserver(calculateDrawerHeight);
    if (bottomButtonRef.current) {
      resizeObserver.observe(bottomButtonRef.current);
    }

    return () => {
      window.removeEventListener("resize", calculateDrawerHeight);
      resizeObserver.disconnect();
    };
  }, [calculateDrawerHeight]);

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
      <main className="fixed inset-0 flex justify-center">
        <div className="relative w-full max-w-lg h-full">
          {imageUrl && (
            <div className="absolute inset-0 z-0">
              <div className="relative w-full h-full">
                <MissionImage imageUrl={imageUrl} />
              </div>
            </div>
          )}

          <BottomDrawer
            collapsedHeight={drawerHeight.collapsed}
            expandedHeight={drawerHeight.expanded}
          >
            <BottomDrawer.Content
              className="bg-white shadow-2xl overflow-visible"
              enableWheelControl
            >
              <div className="bg-linear-to-t from-black via-black/50 via-70% to-transparent absolute bottom-[calc(100%-20px)] left-0 right-0 z-30 flex flex-col gap-6 pb-2 pt-6 px-5 pointer-events-none">
                <div className="flex flex-col gap-2">
                  <MissionLogo logoUrl={brandLogoUrl ?? undefined} />
                  <Typo.MainTitle size="large" className="break-keep text-white">
                    {title}
                  </Typo.MainTitle>
                </div>

                <div className="flex gap-3 items-center">
                  {isRequirePassword && <MissionBadge icon={<Lock />} label="비밀" />}
                  {hasReward && <MissionBadge icon={<Gift />} label="리워드" />}
                </div>

                <div className="h-[56px] w-full" />
              </div>

              <DrawerTabContent
                sections={sections}
                reward={reward}
                showDetailInfo={showDetailInfo}
                detailInfoConfig={detailInfoConfig}
                description={description}
                mission={mission}
                handleXShare={handleXShare}
                handleKakaoShare={handleKakaoShare}
                handleLinkShare={handleLinkShare}
              />
            </BottomDrawer.Content>
          </BottomDrawer>

          <div
            ref={bottomButtonRef}
            className="fixed bottom-0 left-0 right-0 z-60 mx-auto max-w-lg bg-white border-t border-zinc-100 px-5 py-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
          >
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
          </div>
        </div>
      </main>
    </CalloutProvider>
  );
}

interface DrawerTabContentProps {
  sections: string[];
  reward: ReturnType<typeof useReadReward>["data"];
  showDetailInfo: boolean;
  detailInfoConfig: readonly { key: string; value: string | null | undefined }[];
  description: string | null | undefined;
  mission: ReturnType<typeof useMissionIntroData>["mission"];
  handleXShare: () => void;
  handleKakaoShare: () => void;
  handleLinkShare: () => void;
}

function DrawerTabContent({
  sections,
  reward,
  showDetailInfo,
  detailInfoConfig,
  description,
  mission,
  handleXShare,
  handleKakaoShare,
  handleLinkShare,
}: DrawerTabContentProps) {
  const { open, progress } = useBottomDrawer();
  const contentRef = useRef<HTMLDivElement>(null);
  const isFullyOpen = progress >= 0.99;
  const [activeTab, setActiveTab] = useState<(typeof SECTION_IDS)[keyof typeof SECTION_IDS]>(
    SECTION_IDS.MISSION_GUIDE,
  );

  const handleChangeTab = useCallback(
    (value: string) => {
      if (value !== SECTION_IDS.MISSION_GUIDE && value !== SECTION_IDS.REWARD) {
        return;
      }

      setActiveTab(value);
      open();

      setTimeout(() => {
        if (contentRef.current) {
          const container = contentRef.current;

          if (value === SECTION_IDS.MISSION_GUIDE) {
            container.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } else {
            const element = document.getElementById(value);
            if (element) {
              const elementTop = element.offsetTop;
              const offset = SCROLL_OFFSET(value);

              container.scrollTo({
                top: elementTop - offset,
                behavior: "smooth",
              });
            }
          }
        }
      }, 100);
    },
    [open],
  );

  return (
    <>
      <div className="bg-white rounded-t-3xl relative z-40">
        <div className="py-3">
          <div className="h-1 w-9 rounded-md bg-zinc-300 mx-auto" />
        </div>

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
        ref={contentRef}
        data-drawer-scrollable
        className={cn("flex-1 bg-white", isFullyOpen ? "overflow-y-auto" : "overflow-hidden")}
        onPointerDownCapture={e => e.stopPropagation()}
      >
        <div
          id={SECTION_IDS.MISSION_GUIDE}
          className="flex w-full flex-col gap-0 px-5 items-center"
        >
          {showDetailInfo && (
            <div className="flex flex-col gap-6 w-full p-5">
              <div className="flex flex-col gap-4 w-full bg-zinc-50 rounded-md p-6">
                {detailInfoConfig.map(
                  ({ key, value }) =>
                    !!key &&
                    !!value && (
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
              <MissionDescription content={cleanTiptapHTML(description)} className="text-center" />
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

        <MissionFooter />

        <div className="h-32" />
      </div>
    </>
  );
}
