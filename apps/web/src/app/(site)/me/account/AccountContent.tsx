"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import type { User } from "@prisma/client";
import { ButtonV2, Typo } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHeaderRightAction } from "../components/MeLayoutShell";

interface AccountContentProps {
  user: User;
}

function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "-";
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }
  return phone;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Typo.Body size="medium">{label}</Typo.Body>
      <Typo.Body size="large">{value}</Typo.Body>
    </div>
  );
}

export function AccountContent({ user: initialUser }: AccountContentProps) {
  const router = useRouter();
  const setRightAction = useHeaderRightAction();
  const { data: user = initialUser } = useCurrentUser();

  useEffect(() => {
    setRightAction(
      <ButtonV2
        variant="tertiary"
        size="medium"
        className="flex h-full items-center justify-center px-4"
        onClick={() => router.push(ROUTES.ME_ACCOUNT_EDIT)}
      >
        <Typo.SubTitle className="text-base">수정</Typo.SubTitle>
      </ButtonV2>,
    );
    return () => setRightAction(null);
  }, [setRightAction, router]);

  return (
    <div className="flex flex-col gap-8 py-5">
      <div className="flex justify-center">
        <UserAvatar size="large" />
      </div>
      <div className="flex flex-col gap-8 px-5">
        <InfoField label="닉네임" value={user.name} />
        <InfoField label="휴대폰 번호" value={formatPhoneNumber(user.phone)} />
        <InfoField label="연결된 카카오 계정" value={user.email} />
        <ButtonV2 variant="tertiary" size="medium" className="self-start p-0">
          <Typo.ButtonText size="medium" className="text-disabled">
            회원탈퇴
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    </div>
  );
}
