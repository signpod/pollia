"use client";

import Link from "next/link";
import FloatingButton from "../common/FloatingButton";

interface SurveyQuestionCreateFloatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export function SurveyQuestionCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: SurveyQuestionCreateFloatingButtonProps) {
  return (
    <Link href="/survey/question/create">
      <FloatingButton variant={variant} className={className} title="질문 만들기" {...props} />
    </Link>
  );
}
