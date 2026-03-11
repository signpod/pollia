"use client";

import { useEffect } from "react";
import { MeFooter, MyContentTabs, ProfileSection, RecommendedContents } from "./components";

interface MePageContentProps {
  user: { name: string; email: string };
}

export function MePageContent({ user }: MePageContentProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col gap-15 py-5">
      <div className="flex flex-col gap-10">
        <ProfileSection />
        <MyContentTabs />
      </div>
      <div className="h-1 w-full bg-zinc-100" />
      <RecommendedContents userName={user.name} />
      <div className="h-1 w-full bg-zinc-100" />
      <MeFooter />
    </div>
  );
}
