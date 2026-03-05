import { Typo } from "@repo/ui/components";
import Link from "next/link";

const PARTNERSHIP_EMAIL = "hi@pollia.me";

export default function PartnershipPage() {
  return (
    <div className="flex flex-col gap-6 px-5 py-10">
      <div className="flex flex-col gap-1">
        <Typo.MainTitle size="medium">제휴 관련 문의</Typo.MainTitle>
        <Typo.Body size="large" className="text-sub">
          제휴 관련 문의는 아래 메일로 연락 부탁드립니다.
          <br />
          담당 부서에서 내용을 꼼꼼히 검토한 후, 빠른 시일
          <br />
          내에 회신드리겠습니다.
          <br />
          소중한 제안에 감사드립니다.
        </Typo.Body>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-5">
        <Link href={`mailto:${PARTNERSHIP_EMAIL}`} className="text-sub underline">
          <Typo.ButtonText size="large">{PARTNERSHIP_EMAIL}</Typo.ButtonText>
        </Link>
      </div>
    </div>
  );
}
