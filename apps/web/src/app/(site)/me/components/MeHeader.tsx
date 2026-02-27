"use client";

import { ROUTES } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { useGoBack } from "@/hooks/common/useGoBack";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export function MeHeader() {
  const goBack = useGoBack();
  const hasHistory = useCanGoBack();

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center bg-white px-5">
      {hasHistory ? (
        <button
          type="button"
          onClick={goBack}
          className="-ml-5 flex size-12 items-center justify-center"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
      ) : (
        <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] py-3">
          <PolliaIcon className="size-4 text-primary" />
          <PolliaWordmark className="h-[22px] text-black" />
        </Link>
      )}
    </header>
  );
}
