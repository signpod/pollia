"use client";

import PolliaIcon from "@public/svgs/poll-poll-e.svg";
import { Button, FixedBottomLayout, Typo, toast } from "@repo/ui/components";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CREATE_SURVEY_QUESTION_DONE_MESSAGE = "설문의 질문 하나가 성공적으로 만들어졌어요!";

function SurveyQuestionCreateDoneContent() {
  const searchParams = useSearchParams();
  const surveyQuestionId = searchParams.get("surveyQuestionId");

  // TODO: 비정상적 접근에 따른 Redirect 로직 추가
  if (!surveyQuestionId) {
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
      <div className="mb-[160px] flex flex-1 flex-col items-center justify-center gap-6">
        <PolliaIcon className="text-primary size-30" />

        <Typo.MainTitle size="small" className="text-center font-bold whitespace-pre-line">
          {CREATE_SURVEY_QUESTION_DONE_MESSAGE}
        </Typo.MainTitle>

        <Button
          aria-label="설문 질문의 아이디 복사하기"
          variant="secondary"
          leftIcon={<Share2 className="size-6" />}
          onClick={() => {
            navigator.clipboard.writeText(surveyQuestionId);
            toast.success("설문 질문의 아이디가 복사되었어요!");
          }}
        >
          <Typo.ButtonText size="large">설문 질문의 아이디 복사하기</Typo.ButtonText>
        </Button>
      </div>

      <FixedBottomLayout.Content className="flex w-full justify-center bg-white">
        <motion.div
          className="flex w-full max-w-lg flex-col justify-center gap-2 p-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <Link href={"/survey/question/create"} className="w-full">
            <Button className="w-full" variant="secondary" aria-label="질문 하나 더 만들기">
              <Typo.ButtonText size="large">질문 하나 더 만들기</Typo.ButtonText>
            </Button>
          </Link>
          <Link href={`/survey/question/create`} className="w-full">
            <Button
              className="w-full"
              variant="secondary"
              aria-label="질문 하나 더 만들기"
            >
              <Typo.ButtonText size="large">설문 하나</Typo.ButtonText>
            </Button>
          </Link>
        </motion.div>
      </FixedBottomLayout.Content>
    </div>
  );
}

export default function SurveyQuestionCreateDonePage() {
  return (
    <FixedBottomLayout hasBottomGap={false}>
      <Suspense
        fallback={
          <div className="mt-60 text-center">
            <Typo.MainTitle size="small">로딩 중...</Typo.MainTitle>
          </div>
        }
      >
        <SurveyQuestionCreateDoneContent />
      </Suspense>
    </FixedBottomLayout>
  );
}
