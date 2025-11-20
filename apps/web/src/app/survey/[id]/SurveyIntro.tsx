"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useReadSurvey } from "@/hooks/survey";
import { FixedBottomLayout, FloatingButton, Typo } from "@repo/ui/components";
import { Gift } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  SurveyCollection,
  SurveyDescription,
  SurveyImage,
  SurveyLogo,
  SurveyReward,
} from "./components";
import { BottomButton } from "./ui";

export function SurveyIntro({ initialError }: { initialError: AuthError | null }) {
  const params = useParams<{ id: string }>();
  const { data: survey } = useReadSurvey(params.id);
  const { brandLogoUrl, title, estimatedMinutes, deadline, imageUrl, description, target } =
    survey?.data ?? {};
  const [isRewardVisible, setIsRewardVisible] = useState(true);
  const rewardRef = useRef<HTMLDivElement>(null);

  const scrollToReward = () => {
    rewardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // TODO: 리워드 조회
  // const reward = useReadReward(rewardId);
  const reward = {
    name: "1등 : CU 바나나우유 기프티콘, 1명\n2등 : 신세계 상품권 3만원권, 2명\n3등 : 신세계 상품권 1만원권, 5명",
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
                estimatedMinutes={estimatedMinutes ?? undefined}
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
          <BottomButton params={params} initialError={initialError} deadline={deadline} />
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
