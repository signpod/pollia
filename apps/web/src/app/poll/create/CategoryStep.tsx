import { binaryPollCategoryAtom } from "@/atoms/create/binaryPollAtoms";
import { BottomCTALayout, Button, Typo, useStep } from "@repo/ui/components";
import {
  POLL_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
} from "@/constants/poll";
import { PollCategory } from "@/types/domain/poll";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function CategoryStep() {
  const { goBack } = useStep();
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState<PollCategory | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSelectedCategory] = useAtom(binaryPollCategoryAtom);

  const handleToggleCategorySelect = (category: PollCategory) => {
    if (tempSelectedCategory === category) {
      setTempSelectedCategory(null);
    } else {
      setTempSelectedCategory(category);
    }
  };

  const handleSubmit = () => {
    if (!tempSelectedCategory) return;
    setSelectedCategory(tempSelectedCategory);
    goBack();
  };

  return (
    <>
      <div className="flex flex-col gap-4 px-5 pb-6">
        {POLL_CATEGORIES.map((category) => {
          const IconComponent = CATEGORY_ICONS[category];
          const isSelected = tempSelectedCategory === category;

          return (
            <Button
              key={category}
              variant={"ghost"}
              fullWidth={true}
              textAlign="left"
              leftIcon={
                <IconComponent width={24} height={24} strokeWidth={1.5} />
              }
              onClick={() => handleToggleCategorySelect(category)}
              className={cn("justify-start gap-3", isSelected && "bg-zinc-50")}
            >
              <Typo.ButtonText size="large">
                {CATEGORY_LABELS[category]}
              </Typo.ButtonText>
            </Button>
          );
        })}
      </div>

      <BottomCTALayout.CTA>
        <div className="p-5 pb-10">
          <Button
            variant="primary"
            fullWidth={true}
            onClick={handleSubmit}
            disabled={!tempSelectedCategory}
          >
            <Typo.ButtonText>선택하기</Typo.ButtonText>
          </Button>
        </div>
      </BottomCTALayout.CTA>
    </>
  );
}
