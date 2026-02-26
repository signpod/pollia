"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { nameSchema } from "@/schemas/user/userSchema";
import { ButtonV2, Input, Typo } from "@repo/ui/components";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ProfileSection() {
  const { data: user } = useCurrentUser();
  const profileImageUrl = useProfileImageUrl();
  const { mutate: updateName, isPending } = useUpdateUserName();

  const currentName = user?.name ?? "";
  const currentEmail = user?.email ?? "";

  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const trimmed = name.trim();
  const validation = nameSchema.safeParse(trimmed);
  const isChanged = trimmed !== currentName;
  const canSave = isChanged && validation.success && !isPending;
  const errorMessage =
    isChanged && trimmed.length > 0 && !validation.success
      ? validation.error.issues[0]?.message
      : undefined;

  const handleSave = () => {
    if (!canSave) return;
    updateName(trimmed);
  };

  return (
    <section className="flex flex-col gap-4 px-5">
      <Typo.SubTitle size="large">나의 정보</Typo.SubTitle>
      <section className="grid grid-cols-3 items-center ">
        <div className="flex justify-center">
          <UserAvatar size="large" imageUrl={profileImageUrl} />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={10}
              showLength={false}
              errorMessage={errorMessage}
              containerClassName="min-w-0 flex-1"
            />
            <ButtonV2
              variant="primary"
              size="medium"
              disabled={!canSave}
              onClick={handleSave}
              className="shrink-0 h-12"
            >
              <Typo.ButtonText size="medium">저장</Typo.ButtonText>
            </ButtonV2>
          </div>
          <div className="flex w-full items-center justify-between gap-2 rounded-sm border border-zinc-100 bg-zinc-50 px-3 py-2">
            <Typo.Body size="medium" className="text-info truncate">
              {currentEmail}
            </Typo.Body>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#FEE500] px-2.5 py-1 text-[11px] font-bold text-[#3C1E1E]">
              <Image src="/svgs/kakao-icon.svg" alt="" width={10} height={10} />
              <Typo.Body size="small"> 카카오 연동</Typo.Body>
            </span>
          </div>
        </div>
      </section>
    </section>
  );
}
