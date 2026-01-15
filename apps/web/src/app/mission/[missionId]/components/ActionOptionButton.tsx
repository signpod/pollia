"use client";

import { cn } from "@/lib/utils";
import CheckCircle from "@public/svgs/check-circle-filled.svg";
import CheckSquare from "@public/svgs/check-square-filled.svg";
import { Input, Typo } from "@repo/ui/components";
import { cva } from "class-variance-authority";
import { Square } from "lucide-react";
import Image from "next/image";

type SelectType = "radio" | "checkbox";

interface ActionOptionButtonProps {
  title: string;
  description?: string;
  imageUrl?: string;
  selectType?: SelectType;
  isSelected?: boolean;
  isOther?: boolean;
  textAnswer?: string;
  onTextAnswerChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextAnswerBlur?: () => void;
  showOtherError?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ActionOptionButton({
  imageUrl,
  title,
  description,
  className,
  onClick,
  disabled,
  selectType = "radio",
  isSelected = false,
  isOther = false,
  textAnswer = "",
  onTextAnswerChange,
  onTextAnswerBlur,
  showOtherError = false,
}: ActionOptionButtonProps) {
  const containerVariants = cva(
    cn(
      "w-full flex-1 flex flex-col justify-start items-start ring-1 ring-default rounded-md overflow-hidden",
      "disabled:cursor-not-allowed",
    ),
    {
      variants: {
        isSelected: {
          true: "text-icon-point ring-point bg-violet-50 active:ring-point",
          false: "hover:bg-zinc-50",
        },
      },
      defaultVariants: {
        isSelected: false,
      },
    },
  );

  const checkCircleColor = isSelected ? "text-icon-point" : "text-zinc-200";

  const titleVariants = cva("text-left text-left disabled:text-disabled", {
    variants: {
      isSelected: {
        true: "text-point",
      },
      disabled: {
        true: "text-disabled",
      },
    },
    defaultVariants: {
      isSelected: false,
      disabled: false,
    },
  });

  const descriptionVariants = cva("text-info text-left", {
    variants: {
      isSelected: {
        true: "text-point",
      },
      disabled: {
        true: "text-disabled",
      },
    },
    defaultVariants: {
      isSelected: false,
      disabled: false,
    },
  });

  const imageStyle = disabled ? "opacity-30" : "opacity-100";
  const CheckIcon = selectType === "checkbox" ? CheckSquare : CheckCircle;
  const NoneCheckedIcon = selectType === "checkbox" ? Square : null;

  const content = imageUrl ? (
    <>
      <div className="relative flex flex-col items-center gap-0 w-full rounded-sm overflow-hidden">
        <Image
          src={imageUrl}
          width={200}
          height={200}
          className={cn("object-cover w-full h-full", imageStyle)}
          alt=""
          draggable={false}
        />
        <div className="flex flex-col gap-2 flex-1 w-full p-3">
          <div className="flex flex-col gap-0">
            <Typo.ButtonText size="large" className={titleVariants({ isSelected, disabled })}>
              {title}
            </Typo.ButtonText>
            {description && (
              <Typo.ButtonText
                size="medium"
                className={descriptionVariants({ isSelected, disabled })}
              >
                {description}
              </Typo.ButtonText>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3">
          {isSelected ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 bg-white z-0 rounded-full" />
              <CheckIcon className={cn("size-6 z-10 relative", checkCircleColor)} />
            </div>
          ) : NoneCheckedIcon ? (
            <NoneCheckedIcon className={cn("size-6", checkCircleColor)} />
          ) : (
            <div className="size-6" />
          )}
        </div>
      </div>

      {isOther && isSelected && (
        <div
          className="w-full mt-2 text-zinc-900"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          <Input
            placeholder="기타 의견을 적어주세요"
            value={textAnswer}
            onChange={onTextAnswerChange}
            onBlur={onTextAnswerBlur}
            onClick={e => e.stopPropagation()}
            errorMessage={
              showOtherError && !textAnswer.trim() ? "필수 입력 사항입니다." : undefined
            }
          />
        </div>
      )}
    </>
  ) : (
    <>
      <div className="flex items-center gap-2 w-full p-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-0">
            <Typo.ButtonText size="large" className={titleVariants({ isSelected, disabled })}>
              {title}
            </Typo.ButtonText>
            {description && (
              <Typo.ButtonText
                size="medium"
                className={descriptionVariants({ isSelected, disabled })}
              >
                {description}
              </Typo.ButtonText>
            )}
          </div>
        </div>

        <div className="flex h-full">
          {isSelected ? (
            <CheckIcon className={cn("size-6", checkCircleColor)} />
          ) : NoneCheckedIcon ? (
            <NoneCheckedIcon className={cn("size-6", checkCircleColor)} />
          ) : (
            <div className="size-6" />
          )}
        </div>
      </div>

      {isOther && isSelected && (
        <div
          className="w-full mt-2 text-zinc-900 p-3"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          <Input
            placeholder="기타 의견을 적어주세요"
            value={textAnswer}
            onChange={onTextAnswerChange}
            onBlur={onTextAnswerBlur}
            onClick={e => e.stopPropagation()}
            errorMessage={
              showOtherError && !textAnswer.trim() ? "필수 입력 사항입니다." : undefined
            }
          />
        </div>
      )}
    </>
  );

  const showInputField = isOther && isSelected;

  if (showInputField) {
    // Input 내부에 clear 버튼이 있어 <button> 중첩 불가, div + role="button" 사용
    return (
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      <div
        className={cn(containerVariants({ isSelected }), "cursor-pointer select-none", className)}
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(containerVariants({ isSelected }), className)}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
