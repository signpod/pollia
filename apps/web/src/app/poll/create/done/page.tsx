"use client";
import { FixedBottomLayout, Button, Typo, toast } from "@repo/ui/components";
import PolliaIcon from "@public/svgs/poll-poll-e.svg";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Share2 } from "lucide-react";

const CREATE_POLL_DONE_MESSAGE =
  "폴이 성공적으로 만들어졌어요\n어떤 결과가 나올지 같이 기다려봐요!";

function PollCreateDoneContent() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get("pollId");

  // TODO: 비정상적 접근에 따른 Redirect 로직 추가
  if (!pollId) {
    return (
      <div className="mt-60 text-center">
        <Typo.MainTitle size="small" className="text-red-500">
          잘못된 접근입니다.
        </Typo.MainTitle>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary">홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-60">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 mb-[160px]">
        <PolliaIcon className="text-primary size-30" />

        <Typo.MainTitle
          size="small"
          className="text-center whitespace-pre-line font-bold"
        >
          {CREATE_POLL_DONE_MESSAGE}
        </Typo.MainTitle>

        <Button
          aria-label="만든 폴 링크 복사하기"
          variant="secondary"
          leftIcon={<Share2 className="size-6" />}
          onClick={() => {
            const pollUrl = `${window.location.origin}/poll/${pollId}`;
            navigator.clipboard.writeText(pollUrl);
            toast.success("링크 복사 완료!");
          }}
        >
          <Typo.ButtonText size="large">만든 폴 링크 복사하기</Typo.ButtonText>
        </Button>
      </div>

      <FixedBottomLayout.Content className="w-full flex justify-center bg-white">
        <motion.div
          className="flex flex-col justify-center w-full max-w-lg p-5 gap-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <Link href={`/poll/${pollId}`} className="w-full">
            <Button
              className="w-full"
              variant="secondary"
              aria-label="지금 바로 확인하기"
            >
              <Typo.ButtonText size="large">지금 바로 확인하기</Typo.ButtonText>
            </Button>
          </Link>
        </motion.div>
      </FixedBottomLayout.Content>
    </div>
  );
}

export default function PollCreateDonePage() {
  return (
    <FixedBottomLayout hasBottomGap={false}>
      <Suspense
        fallback={
          <div className="mt-60 text-center">
            <Typo.MainTitle size="small">로딩 중...</Typo.MainTitle>
          </div>
        }
      >
        <PollCreateDoneContent />
      </Suspense>
    </FixedBottomLayout>
  );
}
