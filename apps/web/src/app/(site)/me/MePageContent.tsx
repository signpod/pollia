"use client";

import { useEffect } from "react";
import { Footer } from "../(main)/components";
import { MeFooter, MyProjectTabs, ProfileSection, RecommendedProjects } from "./components";

interface MePageContentProps {
  user: { name: string; email: string };
}

export function MePageContent({ user }: MePageContentProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-15 py-5">
        <div className="flex flex-col gap-10">
          <ProfileSection />
          <MyProjectTabs />
        </div>
        <div className="h-1 w-full bg-zinc-100" />
        <RecommendedProjects userName={user.name} />
        <div className="h-1 w-full bg-zinc-100" />
        <MeFooter />
      </div>
      <Footer />
    </>
  );
}
