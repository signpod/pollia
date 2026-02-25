"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import type { User } from "@prisma/client";
import { ButtonV2, Typo } from "@repo/ui/components";
import { useRouter } from "next/navigation";

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
      <Typo.Body size="medium" className="text-sub">
        {label}
      </Typo.Body>
      <Typo.Body size="large">{value}</Typo.Body>
    </div>
  );
}

export function AccountContent({ user: initialUser }: AccountContentProps) {
  const router = useRouter();
  const { data } = useCurrentUser();
  const user = data ?? initialUser;
  const profileImageUrl = useProfileImageUrl();

  return (
    <div className="flex flex-col gap-8 py-10">
      <div className="flex justify-center">
        <UserAvatar size="large" imageUrl={profileImageUrl} />
      </div>
      <div className="flex flex-col gap-8 px-5">
        <InfoField label="닉네임" value={user.name} />
        <InfoField label="휴대폰 번호" value={formatPhoneNumber(user.phone)} />
        <InfoField label="연결된 카카오 계정" value={user.email} />
        <ButtonV2
          variant="tertiary"
          size="medium"
          className="self-start p-0"
          onClick={() => router.push("/me/account/withdraw")}
        >
          <Typo.ButtonText size="medium" className="text-disabled">
            회원탈퇴
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    </div>
  );
}
