"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { MissionCategory } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useFormContext } from "react-hook-form";
import type { CreateMissionFormData } from "../schema";

const CATEGORY_OPTIONS: Array<{
  value: MissionCategory;
  icon: string;
  description: string;
  baseClassName: string;
  selectedClassName: string;
  iconWrapClassName: string;
  selectedIconWrapClassName: string;
  descriptionClassName: string;
  selectedDescriptionClassName: string;
}> = [
  {
    value: MissionCategory.RESEARCH,
    icon: "📋",
    description: "다양한 의견을 수집하고 데이터 분석",
    baseClassName: "border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300",
    selectedClassName: "border-blue-600 bg-blue-600 text-white",
    iconWrapClassName: "bg-blue-100 text-blue-700",
    selectedIconWrapClassName: "bg-white/20 text-white",
    descriptionClassName: "text-blue-700",
    selectedDescriptionClassName: "text-blue-100",
  },
  {
    value: MissionCategory.TEST,
    icon: "🧠",
    description: "질문에 답하고 나에게 맞는 유형 찾기",
    baseClassName: "border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-300",
    selectedClassName: "border-violet-600 bg-violet-600 text-white",
    iconWrapClassName: "bg-violet-100 text-violet-700",
    selectedIconWrapClassName: "bg-white/20 text-white",
    descriptionClassName: "text-violet-700",
    selectedDescriptionClassName: "text-violet-100",
  },
];

interface CreateCategoryStepProps {
  onSelectCategory?: (category: MissionCategory) => void;
}

export function CreateCategoryStep({ onSelectCategory }: CreateCategoryStepProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateMissionFormData>();
  const selectedCategory = watch("category");

  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORY_OPTIONS.map(option => {
        const isSelected = selectedCategory === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(option.value);
                return;
              }
              setValue("category", option.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            className={`rounded-2xl border px-5 py-5 text-left transition-colors ${
              isSelected ? option.selectedClassName : option.baseClassName
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <div
                className={`mb-3 flex size-14 items-center justify-center rounded-2xl ${
                  isSelected ? option.selectedIconWrapClassName : option.iconWrapClassName
                }`}
              >
                <span className="text-[34px] leading-none" aria-hidden>
                  {option.icon}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Typo.SubTitle className="text-lg font-bold leading-snug">
                  {MISSION_CATEGORY_LABELS[option.value]}
                </Typo.SubTitle>
                <Typo.Body
                  size="medium"
                  className={
                    isSelected ? option.selectedDescriptionClassName : option.descriptionClassName
                  }
                >
                  {option.description}
                </Typo.Body>
              </div>
            </div>
          </button>
        );
      })}

      {errors.category?.message ? (
        <Typo.Body size="medium" className="col-span-2 text-red-500">
          {errors.category.message}
        </Typo.Body>
      ) : null}
    </div>
  );
}
