"use client";

import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import FloatingButton from "../common/FloatingButton";

interface MissionCreateFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export function MissionCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: MissionCreateFloatingButtonProps) {
  return (
    <Link href={ROUTES.MISSION_CREATE}>
      <FloatingButton variant={variant} className={className} title="설문 만들기" {...props} />
    </Link>
  );
}
