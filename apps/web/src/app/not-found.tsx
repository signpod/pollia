"use client"

import {
  Button,
  FixedBottomLayout,
  FixedTopLayout,
  Typo,
} from "@repo/ui/components"
import PollPollEOops from "@public/svgs/poll-poll-e-oops.svg"
import { useRouter } from "next/navigation"

const NOT_FOUND_MESSAGE = {
  subTitle: "Oops!",
  title: "요청한 작업을 수행하지 못했어요",
  description: "동일한 문제가 반복될 경우 관리자에게 문의해주세요.",
  buttonText: "이전 작업으로 돌아가기",
} as const

export default function NotFound() {
  const router = useRouter()

  return (
    <FixedBottomLayout className="flex flex-col min-h-screen">
      <FixedTopLayout>
        <FixedTopLayout.Content>
          <div className="h-12" />
        </FixedTopLayout.Content>
      </FixedTopLayout>
      <main className="flex flex-col items-center justify-center gap-6 flex-1">
        <div className="flex flex-col items-center justify-center relative">
          <Typo.MainTitle
            size="small"
            className="absolute top-0 left-0 right-0 text-center translate-y-[calc(-100%-8px)]"
            aria-hidden="true"
          >
            {NOT_FOUND_MESSAGE.subTitle}
          </Typo.MainTitle>
          <PollPollEOops className="size-30" alt="" />
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <Typo.MainTitle size="small">
            {NOT_FOUND_MESSAGE.title}
          </Typo.MainTitle>
          <Typo.Body size="medium" className="text-zinc-500">
            {NOT_FOUND_MESSAGE.description}
          </Typo.Body>
        </div>
      </main>

      <FixedBottomLayout.Content className="p-5">
        <Button className="w-full" onClick={() => router.back()}>
          {NOT_FOUND_MESSAGE.buttonText}
        </Button>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  )
}
