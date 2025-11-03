"use client";

import Link from "next/link";
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
    <Link href="/survey/create">
      <FloatingButton variant={variant} className={className} title="설문 만들기" {...props} />
    </Link>
  );
}
