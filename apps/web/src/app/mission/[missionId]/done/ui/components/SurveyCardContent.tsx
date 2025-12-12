import { Typo } from "@repo/ui/components";
import Image from "next/image";
import type { AnimationRefs } from "../animations/useAnimationRefs";
import { formatDeadline } from "../utils/formatDeadline";

interface SurveyCardContentProps {
  refs: AnimationRefs;
  title?: string | null;
  estimatedMinutes?: number | null;
  deadline?: string | Date | null;
  target?: string | null;
  imageUrl?: string | null;
  brandLogoUrl?: string | null;
}

export function SurveyCardContent({
  refs,
  title,
  estimatedMinutes,
  deadline,
  target,
  imageUrl,
  brandLogoUrl,
}: SurveyCardContentProps) {
  return (
    <div ref={refs.surveyContent} className="flex flex-col gap-2 w-full relative z-20">
      {/* 로고 */}
      <div ref={refs.logo} style={{ opacity: 0 }} className="h-4 w-auto">
        {brandLogoUrl && (
          <Image
            src={brandLogoUrl}
            alt="Brand Logo"
            height={16}
            width={16}
            className="object-contain h-full"
          />
        )}
      </div>

      {/* 제목 */}
      <div ref={refs.title} style={{ opacity: 0 }}>
        <Typo.MainTitle size="small" className="text-left">
          {title}
        </Typo.MainTitle>
      </div>

      {/* 정보 박스 */}
      <div
        ref={refs.infoBox}
        className="w-full flex flex-col gap-3 bg-light rounded-sm p-3"
        style={{ opacity: 0 }}
      >
        {estimatedMinutes && <InfoRow label="소요시간" value={`${estimatedMinutes}분`} />}
        {deadline && <InfoRow label="마감일" value={formatDeadline(deadline)} />}
        {target && <InfoRow label="대상자" value={target} />}
      </div>

      {/* 이미지 */}
      {imageUrl && (
        <div
          ref={refs.image}
          className="w-full aspect-[3/2] overflow-hidden rounded-sm"
          style={{ opacity: 0 }}
        >
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
