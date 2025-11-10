import { scaleValueAtom } from "@/atoms/survey/question/scaleInfoAtoms";
import {
  ButtonV2,
  FixedBottomLayout,
  FixedTopLayout,
  ProgressBar,
  Typo,
} from "@repo/ui/components";
import { useAtom } from "jotai";
import { ChevronLeftIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SurveyLikertScale } from "./components/SurveyLikertScale";

const mockData = {
  title: "설문조사 제목입니다. 최대 20자까지 가능합니다.",
  description: "설문조사 설명입니다. 최대 100자까지 가능합니다.",
  imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
  order: 1,
  totalQuestionCount: 10,
};

export function SurveyScale() {
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useSurveyScaleValue();
  const { title, description, imageUrl, order, totalQuestionCount } = mockData;
  const isFirstQuestion = order === 1;

  return (
    <main>
      <FixedBottomLayout>
        <FixedTopLayout>
          <FixedTopLayout.Content className="pt-3">
            <ProgressBar value={(order / totalQuestionCount) * 100 || 0} />
          </FixedTopLayout.Content>
        </FixedTopLayout>
        <div className="space-y-8 mt-9 px-5 pb-5">
          <section className="pt-5 space-y-2">
            <Typo.MainTitle size="medium">{title}</Typo.MainTitle>
            <Typo.Body size="large" className="text-sub">
              {description}
            </Typo.Body>
            {imageUrl && (
              <figure className="relative aspect-[3/2] overflow-hidden rounded-sm">
                <Image src={imageUrl} alt={title} fill className="object-cover" />
              </figure>
            )}
          </section>

          <SurveyLikertScale value={scaleValue} onChange={handleScaleValueChange}>
            <SurveyLikertScale.ScaleGuide labels={SURVEY_LIKERT_SCALE_TEXT} />
            <SurveyLikertScale.Thumb value={scaleValue} />
          </SurveyLikertScale>
        </div>
        <FixedBottomLayout.Content className="px-5 py-3">
          <nav className="flex gap-2">
            <ButtonV2
              variant="secondary"
              size="large"
              className="w-fit aspect-square"
              disabled={isFirstQuestion}
            >
              <ChevronLeftIcon className="size-6" />
            </ButtonV2>
            <ButtonV2
              variant="primary"
              size="large"
              className="flex-1 flex"
              disabled={!isScaleValueChanged}
            >
              <Typo.ButtonText size="large" className="flex justify-center w-full">
                다음
              </Typo.ButtonText>
            </ButtonV2>
          </nav>
        </FixedBottomLayout.Content>
      </FixedBottomLayout>
    </main>
  );
}

const SURVEY_LIKERT_SCALE_TEXT = ["매우 불만족", "불만족", "보통", "만족", "매우 만족"];

function useSurveyScaleValue() {
  const [isScaleValueChanged, setIsScaleValueChanged] = useState(false);
  const [scaleValue, setScaleValue] = useAtom(scaleValueAtom);

  const handleScaleValueChange = (value: number) => {
    if (!isScaleValueChanged) {
      setIsScaleValueChanged(true);
    }
    setScaleValue(value);
  };

  return { isScaleValueChanged, scaleValue, handleScaleValueChange };
}
