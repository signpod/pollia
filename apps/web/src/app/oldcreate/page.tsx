"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryStep from "./CategoryStep.tsx";
import InfoStep from "./InfoStep.tsx";
import OptionsStep from "./OptionsStep.tsx";
import CompleteStep from "./CompleteStep.tsx";
import FixedBottomButton from "./FixedBottomButton.tsx";
import { useCreatePoll } from "@/hooks/poll/useCreatePoll";
import { Category } from "@/types/dto/poll.ts";

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
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const createPoll = useCreatePoll();

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
      return (s - 1) as 1 | 2 | 3 | 4;
    });
  }, [router]);

  const handleNext = useCallback(async () => {
    // step 3 -> 4 진입 시 API에 생성 요청 전송
    if (step === 3) {
      if (createPoll.isPending) return;
      if (!(options.length >= 2 && options.length <= 10)) return;
      try {
        const payload = {
          title: title.trim(),
          description: description.trim(),
          categories: category?.id || "",
          type: "LIST",
          imageUrl: coverImageUrl,
          options: options.map((o) => ({
            title: o.title,
            description: o.description,
            imageUrl: o.imageUrl,
            externalLinkUrl: o.link,
          })),
        };
        const res = (await createPoll.mutateAsync(payload)) as any;
        const newId: string | undefined = res?.id ?? res?.data?.id;
        if (newId) setCreatedPollId(newId);
        setStep(4);
      } catch {
        alert("생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  }, [step, category, title, description, coverImageUrl, options, createPoll]);

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
          pollId={createdPollId}
          category={category}
          title={title}
          description={description}
          options={options}
          imageUrl={coverImageUrl}
        />
      )}

      {step < 4 && (
        <FixedBottomButton
          onPrev={handlePrev}
          onNext={handleNext}
          disablePrev={false}
          disableNext={!canGoNext || createPoll.isPending}
        />
      )}
    </div>
  );
}
