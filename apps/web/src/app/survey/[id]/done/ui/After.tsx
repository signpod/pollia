"use client";

import { ROUTES } from "@/constants/routes";
import { useReadSurvey } from "@/hooks/survey";
import PolliaLogo from "@public/images/pollia-logo.png";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { Share2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

export function After() {
  const params = useParams<{ id: string }>();
  const { data: survey } = useReadSurvey(params.id);
  const { title, estimatedMinutes, deadline, imageUrl, target } = survey?.data ?? {};
  const router = useRouter();

  return (
    <div className="flex flex-col w-full items-center h-full my-auto">
      <div className="w-full flex flex-col items-center flex-1">
        <Typo.MainTitle size="small" className="text-center">
          방금 참여한 설문을
          <br />
          친구들에게도 공유해보세요👀
        </Typo.MainTitle>

        <div className="w-full p-6">
          <div className="flex flex-col gap-2 bg-white shadow-effect-default rounded-2xl p-4">
            <Image src={PolliaLogo} alt="Pollia Logo" width={52} height={16} />
            <Typo.MainTitle size="small" className="text-left">
              {title}
            </Typo.MainTitle>
            <div className="w-full flex flex-col gap-3 bg-light rounded-sm p-3">
              {estimatedMinutes && <InfoRow label="소요시간" value={`${estimatedMinutes}분`} />}
              {deadline && <InfoRow label="마감일" value={formatDeadline(deadline)} />}
              {target && <InfoRow label="대상자" value={target} />}
            </div>
            {imageUrl && (
              <div className="w-full aspect-[3/2] overflow-hidden rounded-sm bg-red-200">
                <Image
                  src={imageUrl}
                  alt={title || "Survey image"}
                  width={400}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-8 w-full justify-center">
          <button type="button" className="flex flex-col gap-2">
            <div className="bg-[#FEE500] size-12 p-3 rounded-sm">
              <KakaoIcon />
            </div>
            <Typo.Body className="text-sub">카카오톡</Typo.Body>
          </button>

          <button type="button" className="flex flex-col gap-2">
            <div className="bg-white border border-default size-12 p-3 rounded-sm">
              <Share2 />
            </div>
            <Typo.Body className="text-sub">공유하기</Typo.Body>
          </button>
        </div>
      </div>
      <FixedBottomLayout.Content className="px-5 py-3">
        <ButtonV2
          variant="primary"
          size="large"
          className="w-full"
          onClick={() => router.push(ROUTES.HOME)}
        >
          <div className="flex justify-center items-center text-center flex-1">메인으로 가기</div>
        </ButtonV2>
      </FixedBottomLayout.Content>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Typo.Body className="text-disabled">{label}</Typo.Body>
      <Typo.Body className="text-sub">{value}</Typo.Body>
    </div>
  );
}

const formatDeadline = (deadline: string | Date) => {
  return new Date(deadline)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\./g, ".")
    .replace(/\s/g, "");
};
