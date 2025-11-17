"use client";

import { useReadSurvey } from "@/hooks/survey";
import { ButtonV2, FixedBottomLayout, FloatingButton, Typo } from "@repo/ui/components";
import { Gift } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SurveyCollection } from "./components/SurveyCollection";
import { SurveyDescription } from "./components/SurveyDescription";
import { SurveyImage } from "./components/SurveyImage";
import { SurveyLogo } from "./components/SurveyLogo";
import { SurveyReward } from "./components/SurveyReward";

export function SurveyIntro() {
  const params = useParams<{ id: string }>();
  const { data: survey } = useReadSurvey(params.id);
  const { brandLogoUrl, title, estimatedMinutes, deadline, imageUrl, description, target } =
    survey?.data ?? {};
  const [isRewardVisible, setIsRewardVisible] = useState(true);
  const rewardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToReward = () => {
    rewardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // TODO: 리워드 조회
  // const reward = useReadReward(rewardId);
  const reward = {
    name: "CU 바나나우유 기프티콘",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop",
    description: "설문 완료 후 즉시 제공",
  };

  return (
    <>
      <main className="flex w-full flex-col gap-8 p-5">
        <div className="flex w-full flex-col gap-2">
          <SurveyLogo logoUrl={brandLogoUrl ?? undefined} />

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-2">
              <Typo.MainTitle size="medium">{title}</Typo.MainTitle>

              <SurveyCollection
                deadline={deadline ?? undefined}
                estimatedMinutes={estimatedMinutes ?? 10}
                target={target ?? undefined}
              />
            </div>
            {imageUrl && <SurveyImage imageUrl={imageUrl} />}
            <SurveyDescription content={description ?? ""} />
          </div>
        </div>

        <div ref={rewardRef}>
          <SurveyReward
            rewardName={reward.name}
            rewardImage={reward.image}
            rewardDescription={reward.description}
            onVisibilityChange={setIsRewardVisible}
          />
        </div>

        <FixedBottomLayout.Content className="flex w-full justify-end bg-transparent px-4 py-3">
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
          <ButtonV2
            variant="primary"
            size="large"
            className="w-full"
            onClick={() => router.push(`/survey/${params.id}/question`)}
          >
            <Typo.ButtonText size="large" className="flex w-full items-center justify-center">
              참여하고 리워드 받기
            </Typo.ButtonText>
          </ButtonV2>
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
