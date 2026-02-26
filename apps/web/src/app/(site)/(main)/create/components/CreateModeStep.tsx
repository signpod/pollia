"use client";

import { Typo } from "@repo/ui/components";
import { useFormContext } from "react-hook-form";
import type { CreateMissionFormData } from "../schema";

interface CreateModeStepProps {
  onSelectCustom?: () => void;
}

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
      <button
        type="button"
        onClick={() => {
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
        className={`rounded-xl border px-4 py-4 text-left transition-colors ${
          selectedMode === "custom"
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"
        }`}
      >
        <Typo.SubTitle>자유롭게 만들기</Typo.SubTitle>
        <Typo.Body
          size="medium"
          className={selectedMode === "custom" ? "text-zinc-100" : "text-zinc-500"}
        >
          직접 입력해서 프로젝트를 생성합니다.
        </Typo.Body>
      </button>

      <button
        type="button"
        disabled
        className="cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-4 text-left text-zinc-400"
      >
        <Typo.SubTitle className="text-zinc-500">템플릿 사용하기</Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          준비 중
        </Typo.Body>
      </button>

      <Typo.Body size="medium" className="text-zinc-500">
        나중에 추가될 기능이에요.
      </Typo.Body>

      {errors.creationMode?.message ? (
        <Typo.Body size="medium" className="text-red-500">
          {errors.creationMode.message}
        </Typo.Body>
      ) : null}
    </div>
  );
}
