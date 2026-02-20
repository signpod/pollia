"use client";

import { ROUTES } from "@/constants/routes";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  const nav = (
    window as unknown as {
      navigation?: {
        addEventListener: (type: string, cb: () => void) => void;
        removeEventListener: (type: string, cb: () => void) => void;
      };
    }
  ).navigation;
  if (nav) {
    nav.addEventListener("navigatesuccess", callback);
    return () => nav.removeEventListener("navigatesuccess", callback);
  }
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};

const getSnapshot = () => {
  const nav = (window as unknown as { navigation?: { canGoBack: boolean } }).navigation;
  if (nav?.canGoBack !== undefined) return nav.canGoBack;
  return window.history.length > 1;
};

const getServerSnapshot = () => false;

export function MeHeader() {
  const router = useRouter();
  const hasHistory = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center bg-white px-5">
      {hasHistory ? (
        <button
          type="button"
          onClick={() => router.back()}
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
