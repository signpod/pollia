import { useState } from "react";
import { SurveyLikertScale } from "./components/SurveyLikertScale";
import { SurveyQuestionLayout } from "./components/SurveyQuestionLayout";

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
    <SurveyQuestionLayout
      currentOrder={order}
      totalQuestionCount={totalQuestionCount}
      title={title}
      description={description}
      imageUrl={imageUrl}
      isFirstQuestion={isFirstQuestion}
      isNextDisabled={!isScaleValueChanged}
    >
      <div className="h-[125px] px-11 flex flex-col justify-end">
        <SurveyLikertScale value={scaleValue} onChange={handleScaleValueChange}>
          <SurveyLikertScale.Thumb value={scaleValue} />
        </SurveyLikertScale>
      </div>
    </SurveyQuestionLayout>
  );
}

const DEFAULT_SCALE_VALUE = 3;

function useSurveyScaleValue() {
  const [isScaleValueChanged, setIsScaleValueChanged] = useState(false);
  const [scaleValue, setScaleValue] = useState(DEFAULT_SCALE_VALUE);

  const handleScaleValueChange = (value: number) => {
    if (!isScaleValueChanged) {
      setIsScaleValueChanged(true);
    }
    setScaleValue(value);
  };

  return { isScaleValueChanged, scaleValue, handleScaleValueChange };
}
