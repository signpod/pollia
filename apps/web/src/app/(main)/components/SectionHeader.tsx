import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  href: string;
  iconBgClass?: string;
}

export function SectionHeader({
  icon,
  title,
  count,
  href,
  iconBgClass = "bg-violet-50",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className={cn("flex h-7 w-7 items-center justify-center rounded-md text-sm", iconBgClass)}
        >
          {icon}
        </span>
        <Typo.SubTitle size="large" className="flex items-center gap-1.5">
          {title}
          <span className="text-sm font-normal text-info">{count.toLocaleString()}개</span>
        </Typo.SubTitle>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm text-sub transition-colors hover:text-violet-500"
      >
        전체보기
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
