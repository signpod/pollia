"use client";

import FloatingButton from "../common/FloatingButton";

interface SurveyCreateFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export default function PollCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: SurveyCreateFloatingButtonProps) {
  return (
    <FloatingButton variant={variant} className={className} title="설문조사 만들기" {...props} />
  );
}
