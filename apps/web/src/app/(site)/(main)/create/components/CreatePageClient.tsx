"use client";

import { createMission } from "@/actions/mission/create";
import { ROUTES } from "@/constants/routes";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatePageClient() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMission = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const { data } = await createMission({
        title: "제목 없는 미션",
        type: "GENERAL",
        category: "EVENT",
        actionIds: [],
      });
      router.push(ROUTES.CREATE_EDITOR(data.id));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="px-4 py-8">
      <Typo.Body size="large" className="font-semibold text-zinc-900">
        미션 만들기
      </Typo.Body>
      <div className="mt-8 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
        <Typo.Body size="medium" className="text-zinc-500">
          새 미션을 만들어 보세요.
        </Typo.Body>
        <ButtonV2
          variant="primary"
          size="medium"
          className="mt-4"
          onClick={handleAddMission}
          disabled={isAdding}
        >
          <Plus className="mr-1 h-4 w-4" />새 미션 만들기
        </ButtonV2>
        <Typo.Body size="small" className="mt-4 block text-zinc-400">
          만든 미션은{" "}
          <Link href={ROUTES.ME_MY_CONTENT} className="underline">
            나의 콘텐츠
          </Link>
          에서 관리할 수 있어요.
        </Typo.Body>
      </div>
    </div>
  );
}
