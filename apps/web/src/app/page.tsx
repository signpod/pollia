"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PollCreateFloatingButton from "@/components/poll/PollCreateFloatingButton";

export default function Home() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsAtTop(scrollPosition < 100);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="h-[200vh]">이곳에 메인 페이지가 만들어질 예정입니다.</div>

      <Link href="/poll/create" className="fixed bottom-5 right-5">
        <PollCreateFloatingButton
          variant={isAtTop ? "with-text" : "icon-only"}
        />
      </Link>
    </>
  );
}
