"use client";

import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import PolliaFaceGood from "@public/svgs/face/good.svg";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { Typo } from "@repo/ui/components";
import { useMemo } from "react";
import { EventSection } from "./components";
import { useMyResponses } from "./hooks/useMyResponses";

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function MePageContent() {
  const { data: user } = useCurrentUser();
  const { data } = useMyResponses();
  const responses = data?.data ?? [];

  const { inProgressResponses, completedResponses } = useMemo(() => {
    const inProgress = responses.filter(r => r.completedAt === null);
    const completed = responses.filter(r => r.completedAt !== null);
    return { inProgressResponses: inProgress, completedResponses: completed };
  }, [responses]);

  return (
    <div className="space-y-10 p-5">
      <section>
        <Typo.MainTitle size="small" className="mb-3">
          나의 정보
        </Typo.MainTitle>
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
            <PolliaFaceGood className="size-7 text-violet-300" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Typo.Body size="large" className="font-medium">
                {user?.name}
              </Typo.Body>
              <div className="flex items-center gap-0.5 rounded bg-zinc-50 px-1.5 py-0.5">
                <KakaoIcon className="size-3" />
                <Typo.Body size="small" className="text-zinc-500">
                  카카오 계정
                </Typo.Body>
              </div>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Typo.Body size="small">{formatPhoneNumber(user.phone)}</Typo.Body>
              </div>
            )}
          </div>
        </div>
      </section>
      <EventSection
        inProgressResponses={inProgressResponses}
        completedResponses={completedResponses}
      />
    </div>
  );
}
