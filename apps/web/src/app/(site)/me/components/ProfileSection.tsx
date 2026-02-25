"use client";

import { toast } from "@/components/common/Toast";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useProfileImageUrl } from "@/hooks/user/useProfileImageUrl";
import { useUpdateUserName } from "@/hooks/user/useUpdateUserName";
import { nicknameSchema } from "@/schemas/user/userSchema";
import { Typo, bodyVariants } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { useCallback, useEffect, useState } from "react";

interface ProfileSectionProps {
  name: string;
  email: string;
}

export function ProfileSection({ name, email }: ProfileSectionProps) {
  const profileImageUrl = useProfileImageUrl();
  const [nickname, setNickname] = useState(name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const updateName = useUpdateUserName();

  useEffect(() => {
    setNickname(name);
    setErrorMessage(null);
  }, [name]);

  const handleBlur = useCallback(() => {
    setErrorMessage(null);
    const trimmed = nickname.trim();
    if (trimmed === name) return;

    const result = nicknameSchema.safeParse(trimmed);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "닉네임 형식이 올바르지 않아요.";
      setErrorMessage(message);
      toast.warning(message);
      setNickname(name);
      return;
    }

    updateName.mutate(result.data, {
      onError: () => setNickname(name),
    });
  }, [nickname, name, updateName]);

  return (
    <section className="grid grid-cols-[auto_1fr] items-center gap-4 px-5">
      <UserAvatar size="large" imageUrl={profileImageUrl} />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="w-full">
          <input
            type="text"
            value={nickname}
            onChange={e => {
              setNickname(e.target.value);
              setErrorMessage(null);
            }}
            onBlur={handleBlur}
            disabled={updateName.isPending}
            maxLength={20}
            className={cn(
              "flex h-12 w-full rounded-sm bg-white px-4 py-2 placeholder:text-disabled focus-visible:outline-none disabled:bg-zinc-100 disabled:text-zinc-500",
              "ring-1 focus-visible:ring-2",
              errorMessage
                ? "ring-red-500 focus-visible:ring-red-500"
                : "ring-zinc-200 focus-visible:ring-violet-500",
              bodyVariants({ size: "large" }),
            )}
          />
          {errorMessage && (
            <Typo.Body size="small" className="mt-1 text-red-500">
              {errorMessage}
            </Typo.Body>
          )}
        </div>
        <Typo.Body size="small" className="text-info">
          {email}
        </Typo.Body>
      </div>
    </section>
  );
}
