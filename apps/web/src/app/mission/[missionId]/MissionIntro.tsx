"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSectionScrollSync, useSurveyResume } from "@/hooks/mission";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getSessionStorage, setSessionStorage } from "@/lib/sessionStorage";
import { cleanTiptapHTML } from "@/lib/utils";
import { FixedBottomLayout, Tab, Typo } from "@repo/ui/components";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const { activeTab, handleChangeTab } = useSectionScrollSync({
    sections: ["mission-guide", "reward", "participation-method"],
    defaultSection: "mission-guide",
  });

  return (
    <>
      <main className="flex w-full flex-col gap-8">
        <div className="relative">
          {imageUrl && (
            <div className="overflow-hidden sticky top-0 left-0 right-0 z-0">
              <MissionImage imageUrl={imageUrl} />
            </div>
          )}
          <div className="flex w-full flex-col bg-white py-5 rounded-md pb-0 relative z-10 mt-[-20px]">
            <div className="bg-linear-to-t from-black/25 to-transparent h-[52px] absolute top-[-44px] left-0 right-0 z-2" />
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

              {maxParticipants && (
                <ParticipantCount current={currentParticipants ?? 0} max={maxParticipants} />
              )}
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
