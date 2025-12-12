"use client";

import { cn } from "@/lib/utils";
import CheckCircle from "@public/svgs/check-circle-filled.svg";
import CheckSquare from "@public/svgs/check-square-filled.svg";
import { Typo } from "@repo/ui/components";
import { cva } from "class-variance-authority";
import { Square } from "lucide-react";
import Image from "next/image";
import { ComponentProps } from "react";

type SelectType = "radio" | "checkbox";

interface ActionOptionButtonProps extends ComponentProps<"button"> {
  title: string;
  description?: string;
  imageUrl?: string;
  selectType?: SelectType;
  isSelected?: boolean;
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
  ...props
}: ActionOptionButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
  };

  const containerVariants = cva(
    cn(
      "w-full flex-1 flex justify-start items-start p-4 ring-1 ring-inset ring-default rounded-md",
      "hover:bg-zinc-50 active:ring-point",
      "disabled:cursor-not-allowed",
    ),
    {
      variants: {
        isSelected: {
          true: "text-icon-point ring-point bg-violet-50 active:ring-point",
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

  return (
    <button
      className={cn(containerVariants({ isSelected }), className)}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <div className="flex flex-col gap-2 flex-1">
        {imageUrl && (
          <div className="relative size-12 overflow-hidden rounded-sm">
            <Image src={imageUrl} fill className={cn("object-cover", imageStyle)} alt="" />
          </div>
        )}
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
        ) : (
          NoneCheckedIcon && <NoneCheckedIcon className={cn("size-6", checkCircleColor)} />
        )}
      </div>
    </button>
  );
}
