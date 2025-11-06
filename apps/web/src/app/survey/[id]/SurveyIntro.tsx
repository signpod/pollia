import { Typo } from "@repo/ui/components";
import { SurveyCollection } from "./components/SurveyCollection";
import { SurveyDescription } from "./components/SurveyDescription";
import { SurveyImage } from "./components/SurveyImage";
import { SurveyLogo } from "./components/SurveyLogo";
import { SurveyReward } from "./components/SurveyReward";

const mockData = {
  logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop",
  title: "설문조사 제목입니다. 최대 20자까지 가능합니다.",
  estimatedMinutes: 5,
  deadline: new Date("2025-12-25T23:59:00"),
  target: "토스 앱 사용자",
  imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
  description:
    "<p>🔍 설문 목적은 이렇습니다</p><p>💡 이렇게 답변해주시면 됩니다 </p><p>📕 데이터 사용처는 이렇습니다 </p>",

  reward: {
    name: "CU 바나나우유 기프티콘",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop",
    description: "설문 완료 후 즉시 제공",
  },
};

export function SurveyIntro() {
  const { logoUrl, title, estimatedMinutes, deadline, target, imageUrl, description, reward } =
    mockData;

  return (
    <main className="flex w-full flex-col gap-8 px-5">
      <div className="flex w-full flex-col gap-2">
        <SurveyLogo logoUrl={logoUrl} />

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-2">
            <Typo.MainTitle size="medium">{title}</Typo.MainTitle>

            <SurveyCollection
              deadline={deadline}
              estimatedMinutes={estimatedMinutes}
              target={target}
            />
          </div>
          {imageUrl && <SurveyImage imageUrl={imageUrl} />}
          <SurveyDescription content={description} />
        </div>
      </div>

      <SurveyReward
        rewardName={reward.name}
        rewardImage={reward.image}
        rewardDescription={reward.description}
      />
    </main>
  );
}
