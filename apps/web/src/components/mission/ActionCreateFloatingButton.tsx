"use client";

import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import FloatingButton from "../common/FloatingButton";

interface ActionCreateFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export function ActionCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: ActionCreateFloatingButtonProps) {
  return (
    <Link href={ROUTES.ACTION_CREATE}>
      <FloatingButton variant={variant} className={className} title="질문 만들기" {...props} />
    </Link>
  );
}
