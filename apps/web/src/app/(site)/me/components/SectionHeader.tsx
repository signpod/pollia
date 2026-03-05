import { Typo } from "@repo/ui/components";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  label: string;
  count: number;
  href?: string;
  showViewAll?: boolean;
  rightAction?: React.ReactNode;
}

export function SectionHeader({
  label,
  count,
  href,
  showViewAll = true,
  rightAction,
}: SectionHeaderProps) {
  return (
    <div className="flex h-9 items-center justify-between">
      <div className="flex items-center gap-1">
        <Typo.SubTitle size="large">
          {label} {count}개
        </Typo.SubTitle>
      </div>
      {rightAction ??
        (showViewAll && href && (
          <Link href={href} className="flex items-center gap-0.5 text-zinc-500">
            <Typo.ButtonText size="medium">전체보기</Typo.ButtonText>
            <ChevronRightIcon className="size-4" />
          </Link>
        ))}
    </div>
  );
}
