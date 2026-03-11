"use client";

import { ROUTES } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import HomeIcon from "@public/svgs/home-icon.svg";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function MeHeader() {
  const router = useRouter();
  const hasHistory = useCanGoBack();

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
        <Link href={ROUTES.HOME} className="-ml-5 flex size-12 items-center justify-center">
          <HomeIcon className="size-6" />
        </Link>
      )}
    </header>
  );
}
