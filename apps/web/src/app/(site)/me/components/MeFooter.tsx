"use client";

import { signOut } from "@/actions/common/auth";
import { ROUTES } from "@/constants/routes";
import { Typo } from "@repo/ui/components";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PRIVACY_POLICY_URL = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;

export function MeFooter() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(ROUTES.HOME);
  };

  return (
    <footer className="flex flex-col divide-y divide-zinc-100 px-5 text-default">
      <Link href={ROUTES.ME_PARTNERSHIP} className="flex items-center justify-between py-4">
        <Typo.Body size="large">제휴 문의</Typo.Body>
        <ChevronRightIcon className="size-4 text-zinc-400" />
      </Link>
      {PRIVACY_POLICY_URL && (
        <Link
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between py-4"
        >
          <Typo.Body size="large">이용약관 / 개인정보처리방침</Typo.Body>
          <ChevronRightIcon className="size-4 text-zinc-400" />
        </Link>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-between py-4"
      >
        <Typo.Body size="large">로그아웃</Typo.Body>
        <ChevronRightIcon className="size-4 text-zinc-400" />
      </button>
    </footer>
  );
}
