"use client";

import { signOut } from "@/actions/common/auth";
import { ROUTES } from "@/constants/routes";
import { ButtonV2, Typo } from "@repo/ui/components";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INQUIRY_URL = process.env.NEXT_PUBLIC_INQUIRY_URL;
const PRIVACY_POLICY_URL = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;

export function MeFooter() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(ROUTES.HOME);
  };

  return (
    <footer className="flex flex-col gap-2 p-5">
      <div className="flex flex-col">
        {INQUIRY_URL && (
          <Link href={INQUIRY_URL} target="_blank" rel="noopener noreferrer" className="h-12 pl-2">
            <Typo.ButtonText size="large">고객센터</Typo.ButtonText>
          </Link>
        )}
        {INQUIRY_URL && (
          <Link href={INQUIRY_URL} target="_blank" rel="noopener noreferrer" className="h-12 pl-2">
            <Typo.ButtonText size="large">제휴문의</Typo.ButtonText>
          </Link>
        )}
        {PRIVACY_POLICY_URL && (
          <Link
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 pl-2"
          >
            <Typo.ButtonText size="large">이용약관/개인정보처리방침</Typo.ButtonText>
          </Link>
        )}
      </div>
      <ButtonV2
        variant="secondary"
        size="large"
        onClick={handleLogout}
        className="self-start rounded-4xl"
      >
        <Typo.ButtonText size="large" className="w-auto">
          로그아웃
        </Typo.ButtonText>
      </ButtonV2>
    </footer>
  );
}
