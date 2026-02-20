"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { nameSchema } from "@/schemas/user/userSchema";
import { ButtonV2, Input, Typo } from "@repo/ui/components";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AccountEditContentProps {
  userName: string;
}

export function AccountEditContent({ userName }: AccountEditContentProps) {
  const router = useRouter();
  const [name, setName] = useState(userName);
  const { mutate: updateName, isPending } = useUpdateUserName();

  const trimmed = name.trim();
  const validation = nameSchema.safeParse(trimmed);
  const isChanged = trimmed !== userName;
  const errorMessage =
    trimmed.length > 0 && !validation.success ? validation.error.issues[0]?.message : undefined;

  const handleSubmit = () => {
    if (!isChanged || !validation.success) return;
    updateName(trimmed, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-12 items-center justify-center"
        >
          <XIcon className="size-6" />
        </button>
        <ButtonV2
          variant="tertiary"
          size="medium"
          disabled={!isChanged || !validation.success || isPending}
          onClick={handleSubmit}
          className="px-4"
        >
          <Typo.SubTitle className="text-base">완료</Typo.SubTitle>
        </ButtonV2>
      </header>
      <div className="flex flex-col gap-10 px-5 py-5">
        <div className="flex justify-center">
          <UserAvatar size="large" />
        </div>
        <Input
          label="닉네임"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={10}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
