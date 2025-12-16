"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { cleanTiptapHTML } from "@/lib/utils";
import { FixedBottomLayout, Tab, Typo } from "@repo/ui/components";
import { Badge } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { MissionDescription, MissionImage, MissionLogo } from "./components";
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

  // const { isRewardVisible, setIsRewardVisible, rewardRef, scrollToReward } =
  //   useMissionRewardVisibility();

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

            {/* reward */}
            <div className="flex flex-col gap-8 bg-zinc-50 px-5 py-8">
              <div className="flex flex-col gap-4 items-center">
                <div className="bg-zinc-700 rounded-full px-3 py-1">
                  <Typo.SubTitle size="large" className="text-white">
                    참여 혜택
                  </Typo.SubTitle>
                </div>
                <Typo.MainTitle size="medium">
                  참여해주신 모든 분께
                  <br />
                  감사의 선물을 드려요!
                </Typo.MainTitle>
              </div>

              <div className="w-full rounded-md overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                {reward?.data.imageUrl && (
                  <Image
                    src={reward?.data.imageUrl}
                    alt="reward"
                    width={400}
                    height={400}
                    className="w-full h-auto object-contain"
                  />
                )}
                <div className="w-full flex flex-col p-4 gap-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="bg-violet-50 rounded-sm px-3 py-2">
                      <Typo.Body size="medium" className="text-primary">
                        전원 증정
                      </Typo.Body>
                    </div>
                    {brandLogoUrl && (
                      <Image
                        src={brandLogoUrl}
                        alt="reward"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    )}
                  </div>
                  <Typo.MainTitle size="small">{reward?.data.name}</Typo.MainTitle>
                </div>
              </div>
            </div>

            {/* 참여 방법 */}
            <div className="flex flex-col gap-8 bg-white px-5 py-8 items-center">
              <div className="flex flex-col gap-4 items-center">
                <div className="bg-zinc-700 rounded-full px-3 py-1">
                  <Typo.SubTitle size="large" className="text-white">
                    참여 방법
                  </Typo.SubTitle>
                </div>
                <Typo.MainTitle size="medium">참여 방법 한 눈에 보기 👀</Typo.MainTitle>
              </div>

              <div className="flex flex-col gap-8 bg-zinc-50 rounded-md p-8 w-full">
                <div className="flex gap-4 w-full">
                  <div className="relative flex items-center justify-center">
                    <Badge className="fill-black size-15" />
                    <Typo.MainTitle
                      size="small"
                      className="text-white absolute inset-0 z-20 flex items-center justify-center"
                    >
                      1
                    </Typo.MainTitle>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Typo.MainTitle size="small">참여 방법1</Typo.MainTitle>
                    <Typo.Body size="medium" className="text-info">
                      참여 방법1입니다.
                    </Typo.Body>
                  </div>
                </div>
                <div className="flex gap-4 w-full">
                  <div className="relative flex items-center justify-center">
                    <Badge className="fill-black size-15" />
                    <Typo.MainTitle
                      size="small"
                      className="text-white absolute inset-0 z-20 flex items-center justify-center"
                    >
                      2
                    </Typo.MainTitle>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Typo.MainTitle size="small">참여 방법2</Typo.MainTitle>
                    <Typo.Body size="medium" className="text-info">
                      참여 방법2입니다.
                    </Typo.Body>
                  </div>
                </div>
                <div className="flex gap-4 w-full">
                  <div className="relative flex items-center justify-center">
                    <Badge className="fill-black size-15" />
                    <Typo.MainTitle
                      size="small"
                      className="text-white absolute inset-0 z-20 flex items-center justify-center"
                    >
                      3
                    </Typo.MainTitle>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Typo.MainTitle size="small">참여 방법2</Typo.MainTitle>
                    <Typo.Body size="medium" className="text-info">
                      참여 방법2입니다.
                    </Typo.Body>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div ref={rewardRef}>
          {reward && (
            <MissionReward
              rewardName={reward?.data.name ?? ""}
              rewardImage={reward?.data.imageUrl ?? undefined}
              rewardDescription={reward?.data.description ?? undefined}
              onVisibilityChange={setIsRewardVisible}
            />
          )}
        </div> */}

        <FixedBottomLayout.Content className="flex w-full justify-end">
          {/* <div
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
          </div> */}
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
