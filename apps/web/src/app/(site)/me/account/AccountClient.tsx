"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import { useGoBack } from "@/hooks/common/useGoBack";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { Typo } from "@repo/ui/components";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Typo.Body size="medium" className="text-sub">
        {label}
      </Typo.Body>
      <Typo.Body size="large">{value}</Typo.Body>
    </div>
  );
}

export function AccountClient() {
  const goBack = useGoBack();
  const { data: user } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "-";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between bg-white px-1">
        <div className="flex items-center">
          <button
            type="button"
            onClick={goBack}
            className="flex size-12 items-center justify-center"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <Typo.SubTitle size="large">계정관리</Typo.SubTitle>
        </div>
        <Link href={ROUTES.ME_EDIT} className="px-4 py-2">
          <Typo.SubTitle size="large">수정</Typo.SubTitle>
        </Link>
      </header>

      <div className="flex flex-col gap-8 px-5 pt-10">
        <div className="flex justify-center">
          <UserAvatar size="large" imageUrl={profileImageUrl} />
        </div>

        <div className="flex flex-col gap-8">
          <InfoField label="닉네임" value={user?.name ?? "-"} />
          <InfoField label="휴대폰 번호" value={formatPhone(user?.phone)} />
          <InfoField label="연결된 카카오 계정" value={user?.email ?? "-"} />

          <Link href={ROUTES.ME_ACCOUNT_WITHDRAW}>
            <Typo.Body size="medium" className="font-bold text-zinc-400">
              회원탈퇴
            </Typo.Body>
          </Link>
        </div>
      </div>
    </div>
  );
}
