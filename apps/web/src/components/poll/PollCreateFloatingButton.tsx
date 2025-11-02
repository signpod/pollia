"use client";

import FloatingButton from "../common/FloatingButton";

interface PollCreateFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export default function PollCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: PollCreateFloatingButtonProps) {
  return <FloatingButton variant={variant} className={className} title="투표 만들기" {...props} />;
}
