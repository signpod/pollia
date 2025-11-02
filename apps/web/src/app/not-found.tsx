"use client";

import PollPollEOops from "@public/svgs/poll-poll-e-oops.svg";
import { Button, FixedBottomLayout, FixedTopLayout, Typo } from "@repo/ui/components";
import { useRouter } from "next/navigation";

const NOT_FOUND_MESSAGE = {
  subTitle: "Oops!",
  title: "요청한 작업을 수행하지 못했어요",
  description: "동일한 문제가 반복될 경우 관리자에게 문의해주세요.",
  buttonText: "이전 작업으로 돌아가기",
} as const;

export default function NotFound() {
  const { handleClickBack } = useHandleClickBack();

  return (
    <FixedBottomLayout className="flex min-h-screen flex-col">
      <FixedTopLayout>
        <FixedTopLayout.Content>
          <div className="h-12" />
        </FixedTopLayout.Content>
      </FixedTopLayout>
      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative flex flex-col items-center justify-center">
          <Typo.MainTitle
            size="small"
            className="absolute top-0 right-0 left-0 translate-y-[calc(-100%-8px)] text-center"
            aria-hidden="true"
          >
            {NOT_FOUND_MESSAGE.subTitle}
          </Typo.MainTitle>
          <PollPollEOops className="size-30" alt="" />
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <Typo.MainTitle size="small">{NOT_FOUND_MESSAGE.title}</Typo.MainTitle>
          <Typo.Body size="medium" className="text-zinc-500">
            {NOT_FOUND_MESSAGE.description}
          </Typo.Body>
        </div>
      </main>

      <FixedBottomLayout.Content className="p-5">
        <Button className="w-full" onClick={handleClickBack}>
          {NOT_FOUND_MESSAGE.buttonText}
        </Button>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}

function useHandleClickBack() {
  const router = useRouter();

  const handleClickBack = () => {
    router.back();
  };

  return { handleClickBack };
}
