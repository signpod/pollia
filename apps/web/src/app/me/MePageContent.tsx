"use client";

import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { FixedBottomLayout, Typo } from "@repo/ui/components";
import { PhoneIcon } from "lucide-react";
import { useMemo } from "react";
import { EventSection, SettingsSection } from "./components";
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
    <FixedBottomLayout className="bg-background min-h-screen">
      <div className="space-y-10 p-5">
        <section>
          <Typo.MainTitle size="small" className="mb-3">
            나의 정보
          </Typo.MainTitle>
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50">
              <PolliaIcon className="size-6 text-violet-300" />
            </div>
            <Typo.Body size="large" className="flex-1 font-medium">
              {user?.name}
            </Typo.Body>
            {user?.phone && (
              <div className="flex items-center gap-1 text-zinc-600">
                <PhoneIcon className="h-3.5 w-3.5" />
                <Typo.Body size="medium">{formatPhoneNumber(user.phone)}</Typo.Body>
              </div>
            )}
          </div>
        </section>
        <EventSection
          inProgressResponses={inProgressResponses}
          completedResponses={completedResponses}
        />
        <SettingsSection />
      </div>
    </FixedBottomLayout>
  );
}
