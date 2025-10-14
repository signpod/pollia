'use client';
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components";
import PollAddIcon from "@public/svgs/poll-add.svg";
import { useCallback } from "react";

export function FloatingButton() {
  const router = useRouter();
  const handleClick = useCallback(() => {
    router.push("/poll/create");
  }, [router]);

  return (
  <Button variant="primary" className="rounded-full shadow-[0_4px_20px_0_#0000001A] "
  leftIcon={<PollAddIcon />}
  onClick={handleClick}
  >
    투표 만들기
  </Button>
  );
}