"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryStep from "./CategoryStep.tsx";
import InfoStep from "./InfoStep.tsx";
import OptionsStep from "./OptionsStep.tsx";
import CompleteStep from "./CompleteStep.tsx";
import FixedBottomButton from "./FixedBottomButton.tsx";

export type Category =
  | "패션"
  | "음식"
  | "영화"
  | "음악"
  | "게임"
  | "여행"
  | "스포츠"
  | "도서"
  | "IT"
  | "기타";

export type PollOption = {
  id: string;
  imageUrl?: string;
  title: string;
  description?: string;
  link?: string;
};

export default function CreatePollPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>([]);

  const canGoNext = useMemo(() => {
    if (step === 1) return category !== null;
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return options.length >= 2 && options.length <= 10;
    return true;
  }, [step, category, title, options.length]);

  const handlePrev = useCallback(() => {
    setStep((s) => {
      if (s === 1) {
        router.back();
        return s;
      }
      return ((s - 1) as 1 | 2 | 3 | 4);
    });
  }, [router]);

  const handleNext = useCallback(() => {
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  }, []);

  const handleSelectCategory = useCallback((c: Category) => {
    setCategory(c);
  }, []);

  return (
    <div style={{ paddingBottom: 88 }}>
      {step === 1 && (
        <CategoryStep selected={category} onSelect={handleSelectCategory} />
      )}

      {step === 2 && (
        <InfoStep
          coverImageUrl={coverImageUrl}
          title={title}
          description={description}
          onChangeCoverImageUrl={setCoverImageUrl}
          onChangeTitle={setTitle}
          onChangeDescription={setDescription}
        />
      )}

      {step === 3 && (
        <OptionsStep options={options} onChangeOptions={setOptions} />
      )}

      {step === 4 && (
        <CompleteStep
          category={category}
          title={title}
          description={description}
          options={options}
        />
      )}

      {step < 4 && (
        <FixedBottomButton
          onPrev={handlePrev}
          onNext={handleNext}
          disablePrev={false}
          disableNext={!canGoNext}
        />
      )}
    </div>
  );
}


