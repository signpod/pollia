"use client";

import type { User } from "@prisma/client";
import PolliaFaceGood from "@public/svgs/face/good.svg";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { EventSection, MeFooter, RecommendedProjects } from "./components";
import { useMyResponses } from "./hooks/useMyResponses";
import { Footer } from "../(main)/components";

interface MePageContentProps {
  initialUser: User;
}

export function MePageContent({ initialUser }: MePageContentProps) {
  const user = initialUser;
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { data } = useMyResponses();

  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, [showTooltip]);
  const responses = data?.data ?? [];

  const { inProgressResponses, completedResponses } = useMemo(() => {
    const inProgress = responses.filter(r => r.completedAt === null);
    const completed = responses.filter(r => r.completedAt !== null);
    return { inProgressResponses: inProgress, completedResponses: completed };
  }, [responses]);

  return (
    <div className="flex flex-col gap-10 py-6">
      <section className="flex flex-col items-center gap-4 px-5">
        <div className="flex size-20 items-center justify-center rounded-full bg-violet-100">
          <PolliaFaceGood className="size-12 text-violet-300" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Typo.MainTitle size="medium">{user.name}</Typo.MainTitle>
          <Typo.Body size="medium" className="text-info">
            {user.email}
          </Typo.Body>
        </div>
        <ButtonV2
          ref={buttonRef}
          variant="secondary"
          size="medium"
          data-tooltip-id="account-manage"
          onClick={() => setShowTooltip(prev => !prev)}
        >
          <div className="flex items-center justify-center">
            <Typo.ButtonText size="medium">
            계정 관리
            </Typo.ButtonText>
          </div>
        </ButtonV2>
        {showTooltip && (
          <Tooltip id="account-manage" placement="bottom">
            <Typo.Body size="small" className="whitespace-nowrap text-zinc-600">
              곧 만나볼 수 있어요! 조금만 기다려주세요
            </Typo.Body>
          </Tooltip>
        )}
      </section>

      <EventSection
        inProgressResponses={inProgressResponses}
        completedResponses={completedResponses}
      />
      <div className="h-1 w-full bg-zinc-100" /> 
        <RecommendedProjects userName={user.name} />
      <div className="h-1 w-full bg-zinc-100" />
      <MeFooter />
      <Footer />
    </div>
  );
}
