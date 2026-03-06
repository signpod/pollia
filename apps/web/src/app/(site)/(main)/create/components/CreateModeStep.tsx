"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { Typo } from "@repo/ui/components";
import { useFormContext } from "react-hook-form";
import type { CreateMissionFormData } from "../schema";

interface CreateModeStepProps {
  onSelectCustom?: () => void;
}

const MODE_OPTIONS = [
  {
    value: "custom" as const,
    icon: "✨",
    title: "자유롭게 만들기",
    description: `직접 입력해서 ${UBIQUITOUS_CONSTANTS.MISSION}를 생성합니다.`,
    baseClassName: "border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300",
    selectedClassName: "border-blue-600 bg-blue-600 text-white",
    iconWrapClassName: "bg-blue-100 text-blue-700",
    selectedIconWrapClassName: "bg-white/20 text-white",
    descriptionClassName: "text-blue-700",
    selectedDescriptionClassName: "text-blue-100",
    disabled: false,
  },
  {
    value: "template" as const,
    icon: "🧩",
    title: "템플릿 사용하기",
    description: "나중에 추가될 기능이에요.",
    baseClassName: "border-violet-100 bg-violet-50/60 text-violet-400",
    selectedClassName: "border-violet-100 bg-violet-50/60 text-violet-400",
    iconWrapClassName: "bg-violet-100/70 text-violet-300",
    selectedIconWrapClassName: "bg-violet-100/70 text-violet-300",
    descriptionClassName: "text-violet-300",
    selectedDescriptionClassName: "text-violet-300",
    disabled: true,
  },
];

export function CreateModeStep({ onSelectCustom }: CreateModeStepProps) {
  const {
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateMissionFormData>();

  const selectedMode = watch("creationMode");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {MODE_OPTIONS.map(option => {
          const isSelected = selectedMode === option.value;
          const disabled = option.disabled;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              aria-disabled={disabled}
              onClick={() => {
                if (disabled) return;
                if (onSelectCustom) {
                  onSelectCustom();
                  return;
                }
                clearErrors("creationMode");
                setValue("creationMode", "custom", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className={`rounded-2xl border px-5 py-5 text-left transition-colors ${
                disabled ? "cursor-not-allowed opacity-75" : ""
              } ${isSelected ? option.selectedClassName : option.baseClassName}`}
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
                    {option.title}
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
      </div>
      {errors.creationMode?.message ? (
        <Typo.Body size="medium" className="text-red-500">
          {errors.creationMode.message}
        </Typo.Body>
      ) : null}
    </div>
  );
}
