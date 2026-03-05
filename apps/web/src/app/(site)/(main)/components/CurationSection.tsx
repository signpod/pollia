import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

interface CurationSectionProps {
  title: string;
  description: string;
  missions: SurveyCardData[];
  viewAllHref?: string;
  columns?: 2 | 3;
}

export function CurationSection({
  title,
  description,
  missions,
  viewAllHref,
  columns = 3,
}: CurationSectionProps) {
  const displayMissions = columns === 3 ? missions.slice(0, 6) : missions;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 px-5">
        <div className="flex items-center justify-between">
          <Typo.MainTitle size="small" className="text-default">
            {title}
          </Typo.MainTitle>
          {viewAllHref && (
            <Link href={viewAllHref} className="flex items-center gap-2 text-info">
              <Typo.ButtonText size="medium" className="text-info">
                전체보기
              </Typo.ButtonText>
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
        <Typo.Body size="medium" className="text-info">
          {description}
        </Typo.Body>
      </div>

      <div
        className={cn(
          "grid gap-4 px-5",
          columns === 2 ? "grid-cols-2 gap-y-8" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {displayMissions.map(mission => (
          <SurveyCard key={mission.id} survey={mission} />
        ))}
      </div>
    </section>
  );
}
