"use client";

import { Footer } from "../(main)/components";
import { MyProjectTabs, MeFooter, ProfileSection, RecommendedProjects } from "./components";

interface MePageContentProps {
  user: { name: string; email: string };
}

export function MePageContent({ user }: MePageContentProps) {
  return (
    <div className="flex flex-col gap-15 py-10">
      <div className="flex flex-col gap-10">
        <ProfileSection name={user.name} email={user.email} />
        <MyProjectTabs />
      </div>
      <div className="h-1 w-full bg-zinc-100" />
      <RecommendedProjects userName={user.name} />
      <div className="h-1 w-full bg-zinc-100" />
      <MeFooter />
      <Footer />
    </div>
  );
}
